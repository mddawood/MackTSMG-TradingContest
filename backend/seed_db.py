import datetime
from app.database import SessionLocal, Base, engine
from app.main import run_auto_migrations
from app.models.user import User
from app.models.competition import Competition
from app.models.registration import CompetitionRegistration
from app.models.snapshot import LeaderboardSnapshot
from app.models.api_key import APIKey
from app.models.referred_user import ReferredUser
from app.core.security import get_password_hash

def seed():
    print("Seeding database...")
    run_auto_migrations()
    db = SessionLocal()
    
    # 1. Ensure Admin users
    user = db.query(User).filter(User.email == "admin@example.com").first()
    if not user:
        user = User(
            email="admin@example.com",
            full_name="System Admin",
            hashed_password=get_password_hash("Password123"),
            role="admin",
            assigned_tier="Pro",
            uid_status="verified",
            delta_user_id="99999",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created main test user: {user.email} (Admin)")
    else:
        user.role = "admin"
        user.is_verified = True
        db.commit()

    admin_user = db.query(User).filter(User.email == "admin@marketswithmack.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@marketswithmack.com",
            full_name="Mack Admin",
            hashed_password=get_password_hash("Password123"),
            role="admin",
            assigned_tier="Whale",
            uid_status="verified",
            delta_user_id="88888",
            is_verified=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"Created prototype admin user: {admin_user.email}")
    else:
        admin_user.role = "admin"
        admin_user.is_verified = True
        db.commit()

    # 2. Create Active Competition
    comp1 = db.query(Competition).filter(Competition.title == "MWM Trading Championship 2026").first()
    if not comp1:
        comp1 = Competition(
            title="MWM Trading Championship 2026",
            description="Official 60-day trading championship on Delta Exchange. ₹5,00,000 prize pool across Rookie, Trader, Pro, and Whale tiers.",
            start_time=datetime.datetime.utcnow() - datetime.timedelta(days=7),
            end_time=datetime.datetime.utcnow() + datetime.timedelta(days=53),
            is_active=True
        )
        db.add(comp1)
        db.commit()
        db.refresh(comp1)
        print("Created active competition: MWM Trading Championship 2026")

    # 3. Seed Referred Users Whitelist
    test_uids = ["10001", "10002", "10003", "10004", "10005", "10006", "10007", "10008", "10009", "10010", "10011", "10012", "12345", "67890", "99999", "88888"]
    for uid in test_uids:
        existing_ref = db.query(ReferredUser).filter(ReferredUser.delta_user_id == uid).first()
        if not existing_ref:
            ref = ReferredUser(delta_user_id=uid, is_registered=True)
            db.add(ref)
    db.commit()

    # 4. Realistic participants across all 4 tiers from Netlify prototype
    participants = [
        # Trader Tier
        {"name": "Navya Iyer", "email": "navya@example.com", "roi": 140.02, "pnl": 70010.0, "volume": 6363919.0, "delta_id": "10001", "tier": "Trader", "trades": 415, "streak": 5, "rank_change": 1, "start_bal": 50000.0},
        {"name": "Rohan Bose", "email": "rohan@example.com", "roi": 137.86, "pnl": 82716.0, "volume": 3784987.0, "delta_id": "10002", "tier": "Trader", "trades": 176, "streak": 3, "rank_change": -1, "start_bal": 60000.0},
        {"name": "Ananya Verma", "email": "ananya@example.com", "roi": 132.23, "pnl": 99172.0, "volume": 3537350.0, "delta_id": "10003", "tier": "Trader", "trades": 403, "streak": 4, "rank_change": -1, "start_bal": 75000.0},
        {"name": "Rahul Kapoor", "email": "rahul.k@example.com", "roi": 125.89, "pnl": 100712.0, "volume": 4441019.0, "delta_id": "10004", "tier": "Trader", "trades": 76, "streak": 2, "rank_change": 0, "start_bal": 80000.0},
        {"name": "Saanvi Bhat", "email": "saanvi@example.com", "roi": 125.25, "pnl": 112725.0, "volume": 8873968.0, "delta_id": "10005", "tier": "Trader", "trades": 399, "streak": 6, "rank_change": -2, "start_bal": 90000.0},
        {"name": "Rajesh Shetty", "email": "rajesh@example.com", "roi": 119.94, "pnl": 107946.0, "volume": 1393880.0, "delta_id": "10006", "tier": "Trader", "trades": 344, "streak": 3, "rank_change": -2, "start_bal": 90000.0},

        # Rookie Tier
        {"name": "Vihaan Mehta", "email": "vihaan@example.com", "roi": 154.20, "pnl": 46260.0, "volume": 1416226.0, "delta_id": "10007", "tier": "Rookie", "trades": 241, "streak": 4, "rank_change": 2, "start_bal": 30000.0},
        {"name": "Kiran Bose", "email": "kiran@example.com", "roi": 112.45, "pnl": 39357.0, "volume": 1215499.0, "delta_id": "10008", "tier": "Rookie", "trades": 166, "streak": 2, "rank_change": 1, "start_bal": 35000.0},

        # Pro Tier
        {"name": "Diya Patel", "email": "diya@example.com", "roi": 165.40, "pnl": 248100.0, "volume": 9084582.0, "delta_id": "10009", "tier": "Pro", "trades": 387, "streak": 7, "rank_change": 3, "start_bal": 150000.0},
        {"name": "Amit Malhotra", "email": "amit@example.com", "roi": 98.68, "pnl": 197360.0, "volume": 7440256.0, "delta_id": "10010", "tier": "Pro", "trades": 208, "streak": 4, "rank_change": 0, "start_bal": 200000.0},

        # Whale Tier
        {"name": "Karan Mehta", "email": "karan@example.com", "roi": 142.15, "pnl": 710750.0, "volume": 18469256.0, "delta_id": "10011", "tier": "Whale", "trades": 429, "streak": 8, "rank_change": 1, "start_bal": 500000.0},
        {"name": "Reyansh Mehta", "email": "reyansh@example.com", "roi": 128.47, "pnl": 1027760.0, "volume": 26387312.0, "delta_id": "10012", "tier": "Whale", "trades": 512, "streak": 5, "rank_change": -1, "start_bal": 800000.0}
    ]

    for p in participants:
        p_user = db.query(User).filter((User.email == p["email"]) | (User.delta_user_id == p["delta_id"])).first()
        if not p_user:
            p_user = User(
                email=p["email"],
                full_name=p["name"],
                hashed_password=get_password_hash("Password123"),
                delta_user_id=p["delta_id"],
                assigned_tier=p["tier"],
                uid_status="verified"
            )
            db.add(p_user)
            db.commit()
            db.refresh(p_user)
        else:
            p_user.full_name = p["name"]
            p_user.email = p["email"]
            p_user.delta_user_id = p["delta_id"]
            p_user.assigned_tier = p["tier"]
            p_user.uid_status = "verified"
            p_user.is_deleted = False
            db.commit()
            
        # API key
        dummy_key = db.query(APIKey).filter(APIKey.user_id == p_user.id).first()
        if not dummy_key:
            dummy_key = APIKey(
                user_id=p_user.id,
                api_key=f"delta_live_{p['delta_id']}_key",
                encrypted_api_secret="dummy_secret",
                environment="testnet_india",
                is_valid=True
            )
            db.add(dummy_key)
            db.commit()

        # Registration
        reg = db.query(CompetitionRegistration).filter(
            CompetitionRegistration.user_id == p_user.id,
            CompetitionRegistration.competition_id == comp1.id
        ).first()
        if not reg:
            reg = CompetitionRegistration(
                user_id=p_user.id,
                competition_id=comp1.id,
                starting_balance=p["start_bal"]
            )
            db.add(reg)
            db.commit()
            db.refresh(reg)
        else:
            reg.starting_balance = p["start_bal"]
            db.commit()

        # Snapshot
        snap = db.query(LeaderboardSnapshot).filter(LeaderboardSnapshot.registration_id == reg.id).first()
        if not snap:
            snap = LeaderboardSnapshot(
                registration_id=reg.id,
                current_balance=p["start_bal"] + p["pnl"],
                current_equity=p["start_bal"] + p["pnl"],
                absolute_pnl=p["pnl"],
                roi_percentage=p["roi"],
                trading_volume=p["volume"],
                tier=p["tier"],
                trade_count=p["trades"],
                win_streak=p["streak"],
                rank_change=p["rank_change"],
                last_updated=datetime.datetime.utcnow()
            )
            db.add(snap)
            db.commit()
        else:
            snap.current_balance = p["start_bal"] + p["pnl"]
            snap.current_equity = p["start_bal"] + p["pnl"]
            snap.absolute_pnl = p["pnl"]
            snap.roi_percentage = p["roi"]
            snap.trading_volume = p["volume"]
            snap.tier = p["tier"]
            snap.trade_count = p["trades"]
            snap.win_streak = p["streak"]
            snap.rank_change = p["rank_change"]
            snap.last_updated = datetime.datetime.utcnow()
            db.commit()

        print(f"Synced participant: {p['name']} ({p['tier']}) - ROI {p['roi']}%")

    db.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed()
