"""
Delta Exchange Integration Package
==================================
Isolated module for Delta Exchange REST API interactions.
See README.md for architectural guidelines and developer instructions.
"""

from app.integrations.delta.config import DeltaEnvironment, DELTA_BASE_URLS
from app.integrations.delta.time_sync import DeltaTimeSync, time_sync
from app.integrations.delta.auth import generate_signature, build_signed_headers
from app.integrations.delta.client import DeltaClient, DeltaAuthError, DeltaAPIError

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
