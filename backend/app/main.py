from app.routers import auth, api_keys, competitions, admin
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
# Import models to ensure they are registered on the Base metadata
from app import models  # noqa: F401

from sqlalchemy import text

def run_auto_migrations():
    # 1. Ensure all new tables (like referred_users) are created
    Base.metadata.create_all(bind=engine)
    
    # 2. Safely add missing columns to existing tables
    with engine.connect() as conn:
        # Check users table columns
        cursor = conn.execute(text("PRAGMA table_info(users)"))
        columns = [row[1] for row in cursor.fetchall()]
        
        if "delta_user_id" not in columns:
            print("Production Migration: Adding delta_user_id column to users table...")
            # SQLite safe ALTER TABLE
            conn.execute(text("ALTER TABLE users ADD COLUMN delta_user_id VARCHAR"))
            # Create unique index for lookup speed and uniqueness
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_delta_user_id ON users (delta_user_id)"))
            conn.commit()
            print("Production Migration: Completed successfully.")

run_auto_migrations()

app = FastAPI(
    title="Delta Trading Competition API",
    description="Backend API for managing user registrations, encrypted Delta API keys, and periodic leaderboard updates.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to specific frontend URL(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(api_keys.router, prefix="/api-keys", tags=["API Keys"])
app.include_router(competitions.router, prefix="/competitions", tags=["Competitions"])
app.include_router(admin.router, prefix="/admin", tags=["Admin Management"])


@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app": "Delta Trading Competition API",
        "version": "1.0.0"
    }
