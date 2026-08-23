from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    email: str = Field(..., description="The user's email address")
    full_name: str = Field(..., description="The user's full name")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    delta_user_id: str = Field(..., description="The user's Delta Exchange user ID")


class UserLogin(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    role: str
    delta_user_id: Optional[str] = None
    is_deleted: bool

    class Config:
        from_attributes = True
