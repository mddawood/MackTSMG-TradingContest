from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base


class ReferredUser(Base):
    __tablename__ = "referred_users"

    id = Column(Integer, primary_key=True, index=True)
    delta_user_id = Column(String, unique=True, index=True, nullable=False)
    is_registered = Column(Boolean, default=False, nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
