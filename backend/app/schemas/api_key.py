from datetime import datetime
from pydantic import BaseModel, Field


class APIKeyBase(BaseModel):
    api_key: str = Field(..., description="Delta Exchange API Key")
    environment: str = Field(default="testnet", description="Environment for the key ('testnet' or 'mainnet')")


class APIKeyCreate(APIKeyBase):
    api_secret: str = Field(..., description="Delta Exchange API Secret (stored encrypted)")


class APIKeyResponse(APIKeyBase):
    id: int
    is_valid: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
