from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    email: str = Field(..., description="The user's email address")
    full_name: str = Field(..., description="The user's full name")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    delta_user_id: Optional[str] = Field(None, description="The user's Delta Exchange user ID")
    phone: Optional[str] = Field(None, description="WhatsApp or Phone number")


class UserLogin(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    role: str
    delta_user_id: Optional[str] = None
    phone: Optional[str] = None
    assigned_tier: Optional[str] = "Rookie"
    uid_status: Optional[str] = "verified"
    is_deleted: bool

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="The user's registered email address")


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="The password reset token")
    new_password: str = Field(..., min_length=6, description="New password (minimum 6 characters)")


class VerifyResetTokenResponse(BaseModel):
    valid: bool
    email: Optional[str] = None
    detail: Optional[str] = None

