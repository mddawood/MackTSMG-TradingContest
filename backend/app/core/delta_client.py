import time
import hmac
import hashlib
import json
import urllib.parse
import requests
from typing import Dict, Any, Tuple, Optional
from app.core.config import settings


class DeltaClient:
    """
    HTTP Client for interacting with the Delta Exchange REST API.
    Handles HMAC-SHA256 request signing and request dispatching.
    """

    def __init__(self, api_key: str, api_secret: str, environment: str = "testnet"):
        self.api_key = api_key.strip() if api_key else ""
        self.api_secret = api_secret.strip() if api_secret else ""
        self.environment = environment.lower()

        # Select base URL based on environment
        if self.environment == "mainnet":
            self.base_url = settings.DELTA_MAINNET_URL
        elif self.environment == "testnet_india":
            self.base_url = settings.DELTA_TESTNET_INDIA_URL
        elif self.environment == "mainnet_india":
            self.base_url = settings.DELTA_MAINNET_INDIA_URL
        else:
            self.base_url = settings.DELTA_TESTNET_URL

        # Ensure trailing slash is removed
        if self.base_url.endswith("/"):
            self.base_url = self.base_url[:-1]

    def _get_headers(self, method: str, path: str, query_string: str = "", payload: str = "") -> Dict[str, str]:
        """
        Generate authentication headers including HMAC-SHA256 signature.
        Signature payload: METHOD + TIMESTAMP + PATH + QUERY_STRING + PAYLOAD
        """
        timestamp = str(int(time.time()))

        # Message concatenation (omit components if empty, but query_string includes '?')
        message = method.upper() + timestamp + path + query_string + payload

        signature = hmac.new(
            self.api_secret.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        headers = {
            "api-key": self.api_key,
            "timestamp": timestamp,
            "signature": signature,
            "User-Agent": "python-3.10",
        }

        if payload:
            headers["Content-Type"] = "application/json"

        return headers

    def request(self, method: str, path: str, query_params: Optional[Dict[str, Any]] = None, json_body: Optional[Any] = None) -> Any:
        """
        Send a signed request to Delta Exchange API.
        """
        # Format query parameters
        query_string = ""
        if query_params:
            sorted_params = sorted(query_params.items())
            query_string = "?" + urllib.parse.urlencode(sorted_params)

        # Format JSON body (make sure there are no spaces in separators for signature match)
        payload = ""
        if json_body is not None:
            payload = json.dumps(json_body, separators=(",", ":"))

        # Generate signed headers
        headers = self._get_headers(method, path, query_string, payload)

        # Construct absolute URL
        url = self.base_url + path + query_string

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                data=payload if payload else None,
                timeout=10
            )

            # Check for HTTP status errors
            if response.status_code == 401:
                # Reconstruct signature components for print debug
                timestamp = headers.get("timestamp", "")
                sig_message = method.upper() + timestamp + path + query_string + payload
                print(f"DEBUG: Delta API 401 Response: {response.text}")
                print(f"DEBUG: Request URL: {url}")
                print(f"DEBUG: Request Method: {method}")
                print(f"DEBUG: Signature Message: {repr(sig_message)}")
                print(f"DEBUG: API Key: '{self.api_key[:6]}...{self.api_key[-4:]}' (Length: {len(self.api_key)})")
                print(f"DEBUG: API Secret: '{self.api_secret[:6]}...{self.api_secret[-4:]}' (Length: {len(self.api_secret)})")
                raise Exception(f"Authentication failed with Delta Exchange. Details: {response.text}")

            if response.status_code >= 400:
                print(f"DEBUG: Delta API {response.status_code} Response: {response.text}")

            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"DEBUG: Delta API Request Exception: {str(e)}")
            raise Exception(f"HTTP request to Delta Exchange failed: {str(e)}")

    def get_profile(self) -> Dict[str, Any]:
        """Fetch user profile details (GET /v2/profile)"""
        return self.request("GET", "/v2/profile")

    def get_balances(self) -> Any:
        """Fetch account wallet balances (GET /v2/wallet/balances)"""
        return self.request("GET", "/v2/wallet/balances")

    def get_positions(self) -> Any:
        """Fetch open positions (GET /v2/positions/margined)"""
        return self.request("GET", "/v2/positions/margined")

    def get_equity_and_volume(self) -> Tuple[float, float, float]:
        """
        Calculate total equity and volume.
        Returns a tuple: (equity, balance, 30d_volume)
        """
        try:
            # 1. Fetch wallet balances
            balances_res = self.get_balances()

            # Handle standard wrapper structure if present
            if isinstance(balances_res, dict) and "result" in balances_res:
                balances_list = balances_res["result"]
            elif isinstance(balances_res, list):
                balances_list = balances_res
            else:
                balances_list = []

            total_balance = 0.0
            for item in balances_list:
                total_balance += float(item.get("balance", 0.0))

            # 2. Fetch positions for PnL calculation
            positions_res = self.get_positions()

            if isinstance(positions_res, dict) and "result" in positions_res:
                positions_list = positions_res["result"]
            elif isinstance(positions_res, list):
                positions_list = positions_res
            else:
                positions_list = []

            total_pnl = 0.0
            for pos in positions_list:
                total_pnl += float(pos.get("pnl", 0.0))

            # Equity = Wallet Balance + Open Positions Unrealized PnL
            equity = total_balance + total_pnl

            # 3. Fetch volume from user profile
            profile_res = self.get_profile()
            if isinstance(profile_res, dict) and "result" in profile_res:
                profile_data = profile_res["result"]
            elif isinstance(profile_res, dict):
                profile_data = profile_res
            else:
                profile_data = {}

            volume = float(profile_data.get("volume_30d", 0.0))

            return equity, total_balance, volume
        except Exception as e:
            # Re-raise with local context
            raise Exception(f"Failed to calculate equity and volume: {str(e)}")
