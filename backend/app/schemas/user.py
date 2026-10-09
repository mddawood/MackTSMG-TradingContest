import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, field_validator


def validate_password_complexity(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Za-z]", v):
        raise ValueError("Password must contain at least one letter.")
    if not re.search(r"[\d\W_]", v):
        raise ValueError("Password must contain at least one number or special character.")
    return v


def validate_username_format(v: str) -> str:
    cleaned = v.strip().lower()
    if len(cleaned) < 3:
        raise ValueError("Username must be at least 3 characters long.")
    if len(cleaned) > 20:
        raise ValueError("Username cannot exceed 20 characters.")
    if not re.match(r"^[a-zA-Z0-9_]+$", cleaned):
        raise ValueError("Username may only contain letters, numbers, and underscores.")
    return cleaned


class UserBase(BaseModel):
    email: EmailStr = Field(..., description="The user's email address")
    full_name: str = Field(..., description="The user's full name")


class UserCreate(UserBase):
    username: str = Field(..., min_length=3, max_length=20, description="Unique public handle across the organization")
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    delta_user_id: Optional[str] = Field(None, description="The user's Delta Exchange user ID")
    phone: Optional[str] = Field(None, description="WhatsApp or Phone number")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_complexity(v)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        return validate_username_format(v)


class UserLogin(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    role: str
    username: Optional[str] = None
    delta_user_id: Optional[str] = None
    phone: Optional[str] = None
    exchange: Optional[str] = "Delta"
    assigned_tier: Optional[str] = "Rookie"
    uid_status: Optional[str] = "verified"
    is_verified: bool = False
    has_api_key: bool = False
    wallet_balance: Optional[float] = 0.0
    is_deleted: bool

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    exchange: Optional[str] = None
    delta_user_id: Optional[str] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return validate_username_format(v)



class ResendVerificationRequest(BaseModel):
    email: EmailStr = Field(..., description="The user's registered email address")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="The user's registered email address")


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="The password reset token")
    new_password: str = Field(..., min_length=8, description="New password (minimum 8 characters)")

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_complexity(v)


class VerifyResetTokenResponse(BaseModel):
    valid: bool
    email: Optional[str] = None
    detail: Optional[str] = None



