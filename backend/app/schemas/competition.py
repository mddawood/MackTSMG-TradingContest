from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CompetitionBase(BaseModel):
    title: str = Field(..., description="The title of the competition")
    description: Optional[str] = Field(None, description="Detailed rules or description of the competition")
    start_time: datetime = Field(..., description="Competition start date and time")
    end_time: datetime = Field(..., description="Competition end date and time")


class CompetitionCreate(CompetitionBase):
    pass


class CompetitionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_active: Optional[bool] = None


class CompetitionResponse(CompetitionBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
