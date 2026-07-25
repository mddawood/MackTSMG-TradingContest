from datetime import datetime
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    email: str = Field(..., description="The user's email address")
    full_name: str = Field(..., description="The user's full name")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")


class UserLogin(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    role: str
    is_deleted: bool

    class Config:
        from_attributes = True
