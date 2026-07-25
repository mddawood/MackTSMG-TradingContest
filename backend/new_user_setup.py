import os
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

# Absolute path to the SQLite DB used by the app
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'delta_competition.db'))

def reset_db():
    """Delete the existing SQLite DB file (if it exists) and recreate empty tables."""
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"Removed existing DB at {DB_PATH}")
    # Create fresh tables
    Base.metadata.create_all(bind=engine)
    print("Created new empty tables")

def create_user(email: str, password: str):
    db = SessionLocal()
    user = User(email=email, full_name="New User", hashed_password=get_password_hash(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Created user {user.email} with id {user.id}")
    db.close()

if __name__ == "__main__":
    reset_db()
    # Adjust credentials here if you want a different user
    create_user(email="newuser@example.com", password="Password123")
