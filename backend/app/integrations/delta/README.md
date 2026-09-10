# 🛑 Delta Exchange Integration — Developer & AI Agent Instructions

> **IMPORTANT ARCHITECTURAL RULE FOR ALL DEVELOPERS AND AGENTS:**
> **DO NOT MODIFY THIS DIRECTORY (`backend/app/integrations/delta/`) WHEN WORKING ON UI, FRONTEND, ROUTING, OR GENERAL BACKEND TASKS.**
> This module is intentionally segregated to protect exchange communication, HMAC-SHA256 signature generation, and clock synchronization against inadvertent regressions.

---

## 1. Why Was This Segregated?

Connecting to cryptocurrency derivatives exchanges like **Delta Exchange** requires strict adherence to cryptographic request signing and timing:
1. **5-Second Replay Window**: Delta Exchange will immediately reject any request if `|server_time - request_timestamp| > 5 seconds` with an `expired_signature` error.
2. **Clock Drift Between Host and Cloud**: Local development environments (Windows, WSL, containers) frequently experience clock drift of several seconds compared to Delta's origin servers.
3. **Exact Message Serialization**: The HMAC-SHA256 hash requires an exact, whitespace-free string format (`METHOD + TIMESTAMP + PATH + QUERY + BODY`). Any accidental whitespace change or param sorting discrepancy breaks authentication.

By isolating this code here, general application changes (e.g. Admin panel updates, date pickers, CSS styling, leaderboards) will never affect or break Delta Exchange connectivity.

---

## 2. Directory Structure

```
backend/app/integrations/delta/
├── __init__.py         # Public exports (DeltaClient, DeltaTimeSync, etc.)
├── config.py           # Canonical endpoint URLs for Global & India Testnet/Mainnet
├── time_sync.py        # Automatic clock-drift synchronizer with zero-drift guarantee
├── auth.py             # HMAC-SHA256 signature generator & signed header builder
├── client.py           # DeltaClient with auto-retry and friendly error formatting
└── README.md           # This instruction document
```

---

## 3. How Clock Synchronization Works

1. **Passive Continuous Calibration**:
   - Every HTTP response from Delta Exchange includes a `request-in-time` header with origin microsecond timestamps.
   - `DeltaTimeSync.update_from_headers()` reads this header on every single call to continuously maintain the `offset = delta_server_time - local_time`.

2. **Automatic Self-Healing on Expiration**:
   - If a request ever triggers an `expired_signature` error, Delta's error JSON contains `context: {"request_time": ..., "server_time": ...}`.
   - `DeltaClient` automatically captures `server_time`, recalibrates `DeltaTimeSync.offset`, and seamlessly retries the request without failing the user action.

3. **Proactive Calibration**:
   - On initialization or after periods of dormancy, `time_sync.sync_now(base_url)` pings the public `/v2/tickers` endpoint with a cache-buster parameter to guarantee an un-cached origin timestamp.

---

## 4. Environment Base URLs

| Environment Key | Target URL | Usage |
| :--- | :--- | :--- |
| `testnet_india` | `https://cdn-ind.testnet.deltaex.org` | Delta India Testnet Sandbox |
| `mainnet_india` | `https://api.india.delta.exchange` | Delta India Production |
| `testnet` | `https://testnet-api.delta.exchange` | Global Delta Testnet Sandbox |
| `mainnet` | `https://api.delta.exchange` | Global Delta Production |

---

## 5. How to Use DeltaClient in Other Services

Always import `DeltaClient` like this:
```python
from app.integrations.delta import DeltaClient
# (Or via the legacy facade: from app.core.delta_client import DeltaClient)

client = DeltaClient(
    api_key="your_api_key",
    api_secret="your_api_secret",
    environment="testnet_india"  # or "testnet", "mainnet", "mainnet_india"
)

# Fetch wallet balances:
balances = client.get_balances()

# Fetch portfolio metrics (equity, balance, 30d volume):
equity, balance, volume = client.get_equity_and_volume()
```

---

## 6. How to Test & Verify Delta Connection Standalone

Run the standalone verification test from the `backend/` directory:
```bash
python test_delta_connection.py
```
This test performs:
- Origin server time sync verification.
- Clock drift calculation (local vs Delta server).
- Mock & live signed request checks.
- Verification across India Testnet and Global Testnet.
