from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class CompetitionRegistration(Base):
    __tablename__ = "competition_registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    competition_id = Column(Integer, ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False)
    starting_balance = Column(Float, default=0.0, nullable=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="registrations")
    competition = relationship("Competition", back_populates="registrations")
    snapshots = relationship("LeaderboardSnapshot", back_populates="registration", cascade="all, delete-orphan")

    # Enforce uniqueness: A user can only register once per competition
    __table_args__ = (
        UniqueConstraint("user_id", "competition_id", name="uq_user_competition"),
    )
