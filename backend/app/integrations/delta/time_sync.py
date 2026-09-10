"""
Delta Exchange Server Time Synchronizer
=======================================
Delta Exchange enforces a strict 5-second replay window on all authenticated requests.
If the host machine's system clock drifts by more than 5 seconds relative to Delta's servers,
Delta rejects the HMAC-SHA256 signature with:
    {"error": {"code": "expired_signature", "context": {"request_time": ..., "server_time": ...}}}

This module provides automatic, zero-drift clock synchronization:
1. Calibrates a server-time offset (server_time - local_time).
2. Continuously reads the 'request-in-time' header returned on every Delta HTTP response.
3. Automatically recovers and resyncs if an 'expired_signature' error occurs.
"""

import time
import threading
import logging
from typing import Optional, Dict, Any
import requests

logger = logging.getLogger("delta.time_sync")


class DeltaTimeSync:
    """
    Thread-safe clock synchronization manager for Delta Exchange API.
    """
    _instance: Optional["DeltaTimeSync"] = None
    _lock = threading.Lock()

    def __new__(cls) -> "DeltaTimeSync":
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DeltaTimeSync, cls).__new__(cls)
                cls._instance._offset = 0.0
                cls._instance._has_synced = False
                cls._instance._last_sync_time = 0.0
            return cls._instance

    @property
    def offset(self) -> float:
        return self._offset

    @property
    def has_synced(self) -> bool:
        return self._has_synced

    def get_synced_timestamp(self) -> str:
        """
        Returns the current Unix timestamp (in seconds) adjusted for server drift.
        """
        synced_epoch = time.time() + self._offset
        return str(int(synced_epoch))

    def update_from_headers(self, headers: Dict[str, Any]) -> None:
        """
        Calibrate clock offset from Delta's response headers.
        Delta provides 'request-in-time' (in microseconds) on every HTTP response.
        """
        rit = headers.get("request-in-time") or headers.get("Request-In-Time")
        if rit:
            try:
                server_time = int(rit) / 1_000_000.0
                local_now = time.time()
                new_offset = server_time - local_now
                with self._lock:
                    self._offset = new_offset
                    self._has_synced = True
                    self._last_sync_time = local_now
                logger.debug(f"[DeltaTimeSync] Calibrated offset from response header: {new_offset:+.3f}s")
                return
            except (ValueError, TypeError):
                pass

    def update_from_error_context(self, context: Dict[str, Any]) -> bool:
        """
        Calibrate clock offset from an 'expired_signature' error payload.
        Context format: {"request_time": 1789065337, "server_time": 1789065355}
        """
        server_time = context.get("server_time")
        if server_time is not None:
            try:
                local_now = time.time()
                new_offset = float(server_time) - local_now
                with self._lock:
                    self._offset = new_offset
                    self._has_synced = True
                    self._last_sync_time = local_now
                logger.info(f"[DeltaTimeSync] Corrected clock drift from server error context: {new_offset:+.3f}s")
                return True
            except (ValueError, TypeError):
                pass
        return False

    def sync_now(self, base_url: str, force: bool = False) -> float:
        """
        Proactively calibrate offset by pinging Delta's unauthenticated tickers endpoint.
        Uses cache-busting to bypass CDN caching.
        """
        now = time.time()
        if not force and self._has_synced and (now - self._last_sync_time < 300):
            return self._offset

        try:
            url = f"{base_url}/v2/tickers?_sync={int(now * 1000)}"
            t0 = time.time()
            resp = requests.get(url, timeout=4)
            t1 = time.time()

            # Prefer high-precision 'request-in-time' header
            rit = resp.headers.get("request-in-time")
            if rit:
                server_time = int(rit) / 1_000_000.0
                estimated_local = (t0 + t1) / 2.0
                new_offset = server_time - estimated_local
                with self._lock:
                    self._offset = new_offset
                    self._has_synced = True
                    self._last_sync_time = now
                logger.info(f"[DeltaTimeSync] Proactive sync complete. Offset: {new_offset:+.3f}s (Roundtrip: {(t1 - t0)*1000:.1f}ms)")
                return self._offset
        except Exception as e:
            logger.warning(f"[DeltaTimeSync] Proactive sync failed ({e}), keeping current offset ({self._offset:+.3f}s)")

        return self._offset


# Global singleton instance
time_sync = DeltaTimeSync()
