import datetime
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.competition import Competition
from app.models.registration import CompetitionRegistration
from app.models.snapshot import LeaderboardSnapshot
from app.models.api_key import APIKey
from app.models.referred_user import ReferredUser
from app.core.security import get_password_hash

def seed():
    print("Seeding database...")
    db = SessionLocal()
    
    # Clean database tables or create them
    Base.metadata.create_all(bind=engine)
    
    # 1. Create a sample Admin/Test user if not exists
    user = db.query(User).filter(User.email == "dbzdawood@gmail.com").first()
    if not user:
        user = User(
            email="dbzdawood@gmail.com",
            full_name="Dawood",
            hashed_password=get_password_hash("Password123"),
            role="admin"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created main test user: {user.email} (Admin)")
    else:
        # Update existing user to admin
        user.role = "admin"
        db.commit()
        print(f"Ensured main test user is Admin: {user.email}")

    # Create dedicated Admin user if not exists
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@example.com",
            full_name="System Admin",
            hashed_password=get_password_hash("AdminPassword123"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"Created dedicated admin user: {admin_user.email}")
    else:
        admin_user.role = "admin"
        db.commit()
        print(f"Dedicated admin user already exists: {admin_user.email}")

    # 2. Create Active and Upcoming Competitions
    comp1 = db.query(Competition).filter(Competition.title == "MWM Trading Championship 2026").first()
    if not comp1:
        comp1 = Competition(
            title="MWM Trading Championship 2026",
            description="The premier 60-day trading competition on Delta Exchange. Trade any contract, maximize your ROI, and win a share of the ₹5,00,000 prize pool.",
            start_time=datetime.datetime.utcnow() - datetime.timedelta(days=5),
            end_time=datetime.datetime.utcnow() + datetime.timedelta(days=55),
            is_active=True
        )
        db.add(comp1)
        db.commit()
        db.refresh(comp1)
        print("Created active competition: MWM Trading Championship 2026")
    else:
        print("Active competition already exists")

    comp2 = db.query(Competition).filter(Competition.title == "Weekly Options Sprint - Week 1").first()
    if not comp2:
        comp2 = Competition(
            title="Weekly Options Sprint - Week 1",
            description="Maximize your options trading ROI over a 7-day sprint. Top 3 traders win direct cash rewards.",
            start_time=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            end_time=datetime.datetime.utcnow() + datetime.timedelta(days=5),
            is_active=True
        )
        db.add(comp2)
        db.commit()
        db.refresh(comp2)
        print("Created active competition: Weekly Options Sprint - Week 1")

    # 3. Seed Referred Users Whitelist
    test_uids = [
        {"id": "10001", "is_registered": True},
        {"id": "10002", "is_registered": True},
        {"id": "10003", "is_registered": True},
        {"id": "10004", "is_registered": True},
        {"id": "12345", "is_registered": False},
        {"id": "67890", "is_registered": False},
        {"id": "11111", "is_registered": False},
        {"id": "22222", "is_registered": False},
    ]
    for uid_info in test_uids:
        existing_ref = db.query(ReferredUser).filter(ReferredUser.delta_user_id == uid_info["id"]).first()
        if not existing_ref:
            ref = ReferredUser(delta_user_id=uid_info["id"], is_registered=uid_info["is_registered"])
            db.add(ref)
    db.commit()
    print("Seeded referred users whitelist.")

    # 4. Create dummy participants for the leaderboard to make it look alive
    dummy_participants = [
        {"name": "Alice OptionTrader", "email": "alice@example.com", "roi": 45.2, "pnl": 12500.0, "volume": 150000.0, "delta_id": "10001"},
        {"name": "Bob Scalper", "email": "bob@example.com", "roi": 22.8, "pnl": 5700.0, "volume": 85000.0, "delta_id": "10002"},
        {"name": "Charlie Hodler", "email": "charlie@example.com", "roi": -5.4, "pnl": -1100.0, "volume": 12000.0, "delta_id": "10003"},
        {"name": "David Whale", "email": "david@example.com", "roi": 12.5, "pnl": 25000.0, "volume": 980000.0, "delta_id": "10004"},
    ]

    for p in dummy_participants:
        p_user = db.query(User).filter(User.email == p["email"]).first()
        if not p_user:
            p_user = User(
                email=p["email"],
                full_name=p["name"],
                hashed_password=get_password_hash("Password123"),
                delta_user_id=p["delta_id"]
            )
            db.add(p_user)
            db.commit()
            db.refresh(p_user)
            
            # Create a dummy API key record
            dummy_key = APIKey(
                user_id=p_user.id,
                api_key=f"dummy_key_{p['name'].lower().replace(' ', '_')}",
                encrypted_api_secret="dummy_secret_encrypted",
                environment="testnet_india",
                is_valid=True
            )
            db.add(dummy_key)
            db.commit()

            # Register for competition 1
            reg = CompetitionRegistration(
                user_id=p_user.id,
                competition_id=comp1.id,
                starting_balance=1000.0 if p["pnl"] >= 0 else 5000.0
            )
            db.add(reg)
            db.commit()
            db.refresh(reg)

            # Create leaderboard snapshot
            snap = LeaderboardSnapshot(
                registration_id=reg.id,
                current_balance=reg.starting_balance + p["pnl"],
                current_equity=reg.starting_balance + p["pnl"],
                absolute_pnl=p["pnl"],
                roi_percentage=p["roi"],
                trading_volume=p["volume"],
                last_updated=datetime.datetime.utcnow()
            )
            db.add(snap)
            db.commit()
            print(f"Added dummy participant: {p['name']} with ROI {p['roi']}%")

    db.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed()
