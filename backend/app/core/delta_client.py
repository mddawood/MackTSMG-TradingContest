"""
Delta Client Facade (Backward Compatibility Bridge)
===================================================
NOTE: The canonical Delta Exchange integration code has been segregated into:
    `app.integrations.delta`

Please refer to `backend/app/integrations/delta/README.md` for architectural rules.
Do NOT modify the underlying integration code during frontend or generic application updates.
"""

from app.integrations.delta.client import (
    DeltaClient,
    DeltaAuthError,
    DeltaAPIError,
)
from app.integrations.delta.time_sync import DeltaTimeSync, time_sync
from app.integrations.delta.auth import generate_signature, build_signed_headers
from app.integrations.delta.config import DeltaEnvironment, DELTA_BASE_URLS

__all__ = [
    "DeltaClient",
    "DeltaTimeSync",
    "time_sync",
    "DeltaEnvironment",
    "DELTA_BASE_URLS",
    "generate_signature",
    "build_signed_headers",
    "DeltaAuthError",
    "DeltaAPIError",
]
