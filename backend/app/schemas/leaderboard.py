from datetime import datetime
from pydantic import BaseModel, Field


class LeaderboardEntry(BaseModel):
    rank: int = Field(..., description="The user's current ranking")
    full_name: str = Field(..., description="The user's full name")
    roi_percentage: float = Field(..., description="Return on Investment percentage")
    absolute_pnl: float = Field(..., description="Absolute Profit and Loss")
    trading_volume: float = Field(..., description="Cumulative trading volume during the competition")
    tier: str = Field(default="Trader", description="Assigned competition tier")
    trade_count: int = Field(default=0, description="Total executed trade fills")
    win_streak: int = Field(default=0, description="Consecutive winning trades")
    rank_change: int = Field(default=0, description="Rank movement compared to previous snapshot")
    verified: bool = Field(default=True, description="Whether the UID/API is verified")
    last_updated: datetime = Field(..., description="Timestamp of the snapshot")


class LeaderboardResponse(BaseModel):
    competition_id: int
    title: str
    entries: list[LeaderboardEntry]
