import os
import argparse
import sys
from app.database import engine, Base, SessionLocal
# Import models to ensure tables are registered on Base.metadata
from app.models import User, APIKey, Competition, CompetitionRegistration, LeaderboardSnapshot, ReferredUser
from app.core.security import get_password_hash

# Absolute path to the SQLite DB used by the app
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'delta_competition.db'))

def reset_db():
    """Delete the existing SQLite DB file (if it exists) and recreate empty tables."""
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print(f"Successfully removed existing DB at {DB_PATH}")
        except PermissionError:
            print(f"Error: Could not delete {DB_PATH} because it is currently locked by another process.")
            print("Please stop your FastAPI server or any other running application using this database and try again.")
            sys.exit(1)
        except Exception as e:
            print(f"Error deleting DB file: {e}")
            sys.exit(1)
    else:
        print("No existing DB file found to delete. Initializing a new database.")
    
    # Create fresh tables for all imported models
    try:
        Base.metadata.create_all(bind=engine)
        print("Created new empty database tables successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")
        sys.exit(1)

def create_admin_user(email: str, password: str, name: str, role: str):
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User with email {email} already exists. Updating role to '{role}' and password.")
            existing_user.full_name = name
            existing_user.hashed_password = get_password_hash(password)
            existing_user.role = role
            db.commit()
            print(f"Updated existing user: {email}")
        else:
            user = User(
                email=email,
                full_name=name,
                hashed_password=get_password_hash(password),
                role=role
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Successfully created new {role} user:")
            print(f"  Email: {user.email}")
            print(f"  Name: {user.full_name}")
            print(f"  Role: {user.role}")
            print(f"  User ID: {user.id}")
    except Exception as e:
        print(f"Error creating/updating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reset database and/or create an admin user.")
    parser.add_argument("--email", default="admin@example.com", help="Email for the admin user (default: admin@example.com)")
    parser.add_argument("--password", default="AdminPassword123", help="Password for the admin user (default: AdminPassword123)")
    parser.add_argument("--name", default="System Admin", help="Full name of the admin user (default: System Admin)")
    parser.add_argument("--role", default="admin", help="Role for the user (default: admin)")
    parser.add_argument("--no-reset", action="store_true", help="Skip deleting and resetting the database")
    
    args = parser.parse_args()
    
    if not args.no_reset:
        reset_db()
    else:
        print("Skipping database reset, creating user in current database...")
        
    create_admin_user(email=args.email, password=args.password, name=args.name, role=args.role)
