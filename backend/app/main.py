from app.routers import auth, api_keys, competitions, admin
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
# Import models to ensure they are registered on the Base metadata
from app import models  # noqa: F401

# Initialize database tables
Base.metadata.create_all(bind=engine)

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
