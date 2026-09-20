from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # NEW – role column for RBAC
    role = Column(String, default="user", nullable=False)
    delta_user_id = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, nullable=True)
    assigned_tier = Column(String, default="Rookie", nullable=False)
    uid_status = Column(String, default="verified", nullable=False)
    exchange = Column(String, default="Delta", nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Relationships
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    registrations = relationship("CompetitionRegistration", back_populates="user", cascade="all, delete-orphan")

    @property
    def has_api_key(self) -> bool:
        return any(k.is_valid for k in self.api_keys) if self.api_keys else False

