from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class LeaderboardSnapshot(Base):
    __tablename__ = "leaderboard_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("competition_registrations.id", ondelete="CASCADE"), nullable=False)
    current_balance = Column(Float, default=0.0, nullable=False)
    current_equity = Column(Float, default=0.0, nullable=False)
    absolute_pnl = Column(Float, default=0.0, nullable=False)
    roi_percentage = Column(Float, default=0.0, nullable=False)
    trading_volume = Column(Float, default=0.0, nullable=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    registration = relationship("CompetitionRegistration", back_populates="snapshots")
