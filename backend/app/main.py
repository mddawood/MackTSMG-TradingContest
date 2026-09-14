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
            conn.execute(text("ALTER TABLE users ADD COLUMN delta_user_id VARCHAR"))
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_delta_user_id ON users (delta_user_id)"))
            conn.commit()
            print("Production Migration: Completed successfully.")

        if "phone" not in columns:
            print("Production Migration: Adding phone column to users table...")
            conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
            conn.commit()

        if "assigned_tier" not in columns:
            print("Production Migration: Adding assigned_tier column to users table...")
            conn.execute(text("ALTER TABLE users ADD COLUMN assigned_tier VARCHAR DEFAULT 'Rookie'"))
            conn.commit()

        if "uid_status" not in columns:
            print("Production Migration: Adding uid_status column to users table...")
            conn.execute(text("ALTER TABLE users ADD COLUMN uid_status VARCHAR DEFAULT 'verified'"))
            conn.commit()

        # Check leaderboard_snapshots table columns
        cursor = conn.execute(text("PRAGMA table_info(leaderboard_snapshots)"))
        snap_cols = [row[1] for row in cursor.fetchall()]

        if "tier" not in snap_cols:
            print("Production Migration: Adding tier column to leaderboard_snapshots...")
            conn.execute(text("ALTER TABLE leaderboard_snapshots ADD COLUMN tier VARCHAR DEFAULT 'Trader'"))
            conn.commit()

        if "trade_count" not in snap_cols:
            print("Production Migration: Adding trade_count column to leaderboard_snapshots...")
            conn.execute(text("ALTER TABLE leaderboard_snapshots ADD COLUMN trade_count INTEGER DEFAULT 0"))
            conn.commit()

        if "win_streak" not in snap_cols:
            print("Production Migration: Adding win_streak column to leaderboard_snapshots...")
            conn.execute(text("ALTER TABLE leaderboard_snapshots ADD COLUMN win_streak INTEGER DEFAULT 0"))
            conn.commit()

        if "rank_change" not in snap_cols:
            print("Production Migration: Adding rank_change column to leaderboard_snapshots...")
            conn.execute(text("ALTER TABLE leaderboard_snapshots ADD COLUMN rank_change INTEGER DEFAULT 0"))
            conn.commit()

        # Check referred_users table columns
        cursor = conn.execute(text("PRAGMA table_info(referred_users)"))
        ref_cols = [row[1] for row in cursor.fetchall()]

        if "exchange" not in ref_cols:
            print("Production Migration: Adding exchange column to referred_users table...")
            conn.execute(text("ALTER TABLE referred_users ADD COLUMN exchange VARCHAR DEFAULT 'Delta'"))
            # Backfill existing rows: if length(delta_user_id) == 6, set exchange = 'Shark', otherwise ensure default 'Delta'
            conn.execute(text("UPDATE referred_users SET exchange = 'Shark' WHERE length(delta_user_id) == 6"))
            conn.execute(text("UPDATE referred_users SET exchange = 'Delta' WHERE exchange IS NULL OR exchange = ''"))
            conn.commit()
            print("Production Migration: Completed successfully for referred_users.")

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
