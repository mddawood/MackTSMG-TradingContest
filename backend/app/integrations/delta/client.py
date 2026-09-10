"""
Delta Exchange HTTP API Client
==============================
Robust HTTP client for interacting with Delta Exchange REST API endpoints.
Features:
- Automatic HMAC-SHA256 request signing
- Zero-drift clock synchronization (auto-calibrates against Delta servers)
- Automatic retry on 'expired_signature'
- Support for Testnet, Mainnet, India Testnet, and India Mainnet
"""

import logging
import requests
from typing import Dict, Any, Tuple, Optional, List

from app.integrations.delta.config import (
    DELTA_BASE_URLS,
    DELTA_REQUEST_TIMEOUT_SECONDS,
    DELTA_MAX_SIGNATURE_RETRY,
    DeltaEnvironment,
)
from app.integrations.delta.time_sync import time_sync
from app.integrations.delta.auth import (
    build_query_string,
    build_payload_string,
    build_signed_headers,
)

logger = logging.getLogger("delta.client")


class DeltaAuthError(Exception):
    """Raised when authentication with Delta Exchange fails."""
    pass


class DeltaAPIError(Exception):
    """Raised when Delta Exchange returns a non-200 API error."""
    pass


class DeltaClient:
    """
    Client for interacting with Delta Exchange REST APIs.
    """

    def __init__(self, api_key: str, api_secret: str, environment: str = "testnet"):
        self.api_key = api_key.strip() if api_key else ""
        self.api_secret = api_secret.strip() if api_secret else ""
        self.environment = environment.lower().strip()

        # Resolve base URL from configuration
        self.base_url = DELTA_BASE_URLS.get(
            self.environment,
            DELTA_BASE_URLS[DeltaEnvironment.TESTNET.value]
        ).rstrip("/")

        # Proactively calibrate clock offset if not yet calibrated
        if not time_sync.has_synced:
            time_sync.sync_now(self.base_url)

    def request(
        self,
        method: str,
        path: str,
        query_params: Optional[Dict[str, Any]] = None,
        json_body: Optional[Any] = None,
        retry_count: int = 0
    ) -> Any:
        """
        Send a signed request to Delta Exchange API.
        Automatically syncs timestamp and recovers from signature expiration.
        """
        query_string = build_query_string(query_params)
        payload = build_payload_string(json_body)
        url = self.base_url + path + query_string

        headers = build_signed_headers(
            api_key=self.api_key,
            api_secret=self.api_secret,
            method=method,
            path=path,
            query_string=query_string,
            payload=payload
        )

        try:
            response = requests.request(
                method=method.upper(),
                url=url,
                headers=headers,
                data=payload if payload else None,
                timeout=DELTA_REQUEST_TIMEOUT_SECONDS
            )

            # Continually calibrate clock drift from every incoming response header
            time_sync.update_from_headers(response.headers)

            # Handle 401 Authentication & Signature Errors
            if response.status_code == 401:
                try:
                    err_data = response.json()
                except Exception:
                    err_data = {}

                err_code = err_data.get("error", {}).get("code", "")
                err_context = err_data.get("error", {}).get("context", {})

                # Automatic recovery from clock drift / expired signature
                if err_code == "expired_signature" and retry_count < DELTA_MAX_SIGNATURE_RETRY:
                    logger.warning(f"[DeltaClient] Encountered expired_signature (attempt {retry_count + 1}). Auto-calibrating clock offset...")
                    if not time_sync.update_from_error_context(err_context):
                        # Force proactive sync if context didn't provide server_time
                        time_sync.sync_now(self.base_url, force=True)

                    # Seamlessly retry request with refreshed timestamp
                    return self.request(
                        method=method,
                        path=path,
                        query_params=query_params,
                        json_body=json_body,
                        retry_count=retry_count + 1
                    )

                # Format user-friendly error message
                error_msg = self._format_auth_error(err_code, response.text)
                logger.error(f"[DeltaClient] Auth failure: {error_msg} (URL: {url})")
                raise DeltaAuthError(error_msg)

            # Handle generic API errors (400, 403, 404, 500, etc.)
            if response.status_code >= 400:
                logger.error(f"[DeltaClient] API Error {response.status_code}: {response.text}")
                raise DeltaAPIError(f"Delta API error ({response.status_code}): {response.text}")

            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"[DeltaClient] Network exception connecting to {url}: {str(e)}")
            raise Exception(f"Failed to communicate with Delta Exchange: {str(e)}")

    def _format_auth_error(self, code: str, raw_text: str) -> str:
        """Translate raw Delta error codes into clear, actionable messages."""
        if code == "expired_signature":
            return "Request signature expired. Clock sync has been recalibrated; please retry."
        elif code == "invalid_api_key":
            return "Invalid API Key. Please verify your Delta Exchange API key."
        elif code == "invalid_signature":
            return "Invalid API Secret or Signature. Please ensure you pasted the exact API Secret."
        elif code == "ip_not_whitelisted":
            return "IP Address not whitelisted. Please add this server's IP to your Delta API key whitelist."
        elif code == "invalid_permission":
            return "Insufficient API permissions. Please enable Read permissions on your API key."
        return f"Authentication failed with Delta Exchange. Details: {raw_text}"

    # --------------------------------------------------------------------------
    # API Methods
    # --------------------------------------------------------------------------

    def get_balances(self) -> Any:
        """Fetch account wallet balances (GET /v2/wallet/balances)"""
        return self.request("GET", "/v2/wallet/balances")

    def get_positions(self) -> Any:
        """Fetch open positions (GET /v2/positions/margined)"""
        return self.request("GET", "/v2/positions/margined")

    def get_profile(self) -> Dict[str, Any]:
        """
        Fetch user profile details (GET /v2/profile).
        Falls back gracefully to balance user_id if restricted for the API key.
        """
        try:
            return self.request("GET", "/v2/profile")
        except Exception as e:
            if "Authentication failed" in str(e) or "401" in str(e):
                try:
                    balances = self.get_balances()
                    if isinstance(balances, dict) and "result" in balances and len(balances["result"]) > 0:
                        user_id = balances["result"][0].get("user_id", "")
                        return {"result": {"id": str(user_id), "volume_30d": 0.0}}
                    elif isinstance(balances, list) and len(balances) > 0:
                        user_id = balances[0].get("user_id", "")
                        return {"result": {"id": str(user_id), "volume_30d": 0.0}}
                except Exception:
                    pass
                return {"result": {"id": "", "volume_30d": 0.0}}
            raise e

    def get_equity_and_volume(self) -> Tuple[float, float, float]:
        """
        Calculate total equity and volume.
        Returns: (equity, balance, 30d_volume)
        """
        try:
            balances_res = self.get_balances()
            balances_list = balances_res.get("result", []) if isinstance(balances_res, dict) else (balances_res if isinstance(balances_res, list) else [])

            total_balance = 0.0
            for item in balances_list:
                total_balance += float(item.get("balance", 0.0))

            positions_res = self.get_positions()
            positions_list = positions_res.get("result", []) if isinstance(positions_res, dict) else (positions_res if isinstance(positions_res, list) else [])

            total_pnl = 0.0
            for pos in positions_list:
                total_pnl += float(pos.get("pnl", 0.0))

            equity = total_balance + total_pnl

            profile_res = self.get_profile()
            profile_data = profile_res.get("result", {}) if isinstance(profile_res, dict) else (profile_res if isinstance(profile_res, dict) else {})
            volume = float(profile_data.get("volume_30d", 0.0))

            return equity, total_balance, volume
        except Exception as e:
            raise Exception(f"Failed to calculate equity and volume: {str(e)}")

    def get_fills(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch recent trade fills (GET /v2/fills)."""
        try:
            res = self.request("GET", "/v2/fills", query_params={"limit": limit})
            if isinstance(res, dict) and "result" in res:
                return res["result"]
            elif isinstance(res, list):
                return res
            return []
        except Exception as e:
            logger.warning(f"[DeltaClient] Error fetching fills: {str(e)}")
            return []

    def validate_key(self) -> Dict[str, Any]:
        """
        Validates the API key by querying balances.
        Returns basic account verification info if valid.
        """
        balances = self.get_balances()
        profile = self.get_profile()
        return {
            "valid": True,
            "profile": profile.get("result", {}) if isinstance(profile, dict) else {},
            "balances_count": len(balances.get("result", [])) if isinstance(balances, dict) and "result" in balances else 0
        }
