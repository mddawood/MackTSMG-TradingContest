from datetime import datetime
from pydantic import BaseModel, Field


class LeaderboardEntry(BaseModel):
    rank: int = Field(..., description="The user's current ranking")
    full_name: str = Field(..., description="The user's full name")
    roi_percentage: float = Field(..., description="Return on Investment percentage")
    absolute_pnl: float = Field(..., description="Absolute Profit and Loss")
    trading_volume: float = Field(..., description="Cumulative trading volume during the competition")
    last_updated: datetime = Field(..., description="Timestamp of the snapshot")


class LeaderboardResponse(BaseModel):
    competition_id: int
    title: str
    entries: list[LeaderboardEntry]
