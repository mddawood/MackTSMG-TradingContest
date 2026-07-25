from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
# SQLite requires check_same_thread=False, PostgreSQL/other DBs do not support it
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args
)

# Session factory - creates database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
# All our database tables will inherit from this
Base = declarative_base()

# Dependency function for FastAPI


def get_db():
    """Create a database session for each request"""
    db = SessionLocal()
    try:
        yield db  # Give the session to the API endpoint
    finally:
        db.close()  # Always close when done
