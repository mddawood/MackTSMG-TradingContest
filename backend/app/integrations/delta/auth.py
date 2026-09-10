"""
Delta Exchange Authentication & Request Signing
===============================================
CRITICAL SPECIFICATION - DO NOT ALTER SIGNING FORMULA:
Delta Exchange verifies request integrity using HMAC-SHA256.

The pre-hash message MUST strictly follow this exact concatenation:
    METHOD + TIMESTAMP + PATH + QUERY_STRING + BODY

Rules:
1. METHOD must be uppercase (GET, POST, DELETE, etc.).
2. TIMESTAMP must be the synced Unix epoch in seconds (as string).
3. PATH must include leading slash (e.g. '/v2/wallet/balances').
4. QUERY_STRING includes the leading '?' and parameters sorted alphabetically.
5. BODY must be raw minified JSON with no whitespace around separators (separators=(',', ':')).
6. HMAC uses the api_secret encoded in UTF-8 and returns a lowercase hex digest.
"""

import hmac
import hashlib
import json
import urllib.parse
from typing import Dict, Any, Optional, Tuple
from app.integrations.delta.config import DELTA_USER_AGENT
from app.integrations.delta.time_sync import time_sync


def build_query_string(params: Optional[Dict[str, Any]]) -> str:
    """Format and sort query parameters for deterministic signature matching."""
    if not params:
        return ""
    sorted_params = sorted(params.items())
    return "?" + urllib.parse.urlencode(sorted_params)


def build_payload_string(json_body: Optional[Any]) -> str:
    """Format JSON payload minified without whitespace."""
    if json_body is None:
        return ""
    return json.dumps(json_body, separators=(",", ":"))


def generate_signature(
    api_secret: str,
    method: str,
    path: str,
    query_string: str = "",
    payload: str = "",
    timestamp: Optional[str] = None
) -> Tuple[str, str]:
    """
    Generate the HMAC-SHA256 signature and timestamp for Delta Exchange API.
    Returns:
        (signature_hex, timestamp_str)
    """
    ts = timestamp if timestamp is not None else time_sync.get_synced_timestamp()
    message = method.upper() + ts + path + query_string + payload

    signature = hmac.new(
        api_secret.strip().encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    return signature, ts


def build_signed_headers(
    api_key: str,
    api_secret: str,
    method: str,
    path: str,
    query_string: str = "",
    payload: str = "",
    timestamp: Optional[str] = None
) -> Dict[str, str]:
    """
    Construct all required HTTP headers for an authenticated request to Delta Exchange.
    """
    sig, ts = generate_signature(
        api_secret=api_secret,
        method=method,
        path=path,
        query_string=query_string,
        payload=payload,
        timestamp=timestamp
    )

    headers = {
        "api-key": api_key.strip(),
        "timestamp": ts,
        "signature": sig,
        "User-Agent": DELTA_USER_AGENT,
    }

    if payload:
        headers["Content-Type"] = "application/json"

    return headers
