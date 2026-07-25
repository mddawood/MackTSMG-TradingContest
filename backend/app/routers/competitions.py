from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.routers.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.api_key import APIKey
from app.models.competition import Competition
from app.models.registration import CompetitionRegistration
from app.models.snapshot import LeaderboardSnapshot
from app.schemas.competition import CompetitionCreate, CompetitionResponse
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardEntry
from app.core.delta_client import DeltaClient
from app.core import security

router = APIRouter()


@router.post("/", response_model=CompetitionResponse, status_code=status.HTTP_201_CREATED)
def create_competition(
    comp_in: CompetitionCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new competition.
    """
    db_comp = Competition(
        title=comp_in.title,
        description=comp_in.description,
        start_time=comp_in.start_time,
        end_time=comp_in.end_time,
        is_active=True
    )
    db.add(db_comp)
    db.commit()
    db.refresh(db_comp)
    return db_comp


@router.get("/", response_model=List[CompetitionResponse])
def list_competitions(db: Session = Depends(get_db)):
    """
    List all active/inactive competitions.
    """
    return db.query(Competition).all()


@router.get("/my-registrations")
def get_my_registrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the registrations of the currently logged-in user with their latest leaderboard snapshots.
    """
    regs = db.query(CompetitionRegistration).filter(
        CompetitionRegistration.user_id == current_user.id
    ).all()

    result = []
    for reg in regs:
        snapshot = db.query(LeaderboardSnapshot).filter(
            LeaderboardSnapshot.registration_id == reg.id
        ).first()

        if snapshot:
            curr_bal = snapshot.current_balance
            curr_eq = snapshot.current_equity
            pnl = snapshot.absolute_pnl
            roi = snapshot.roi_percentage
            vol = snapshot.trading_volume
            last_upd = snapshot.last_updated
        else:
            curr_bal = reg.starting_balance
            curr_eq = reg.starting_balance
            pnl = 0.0
            roi = 0.0
            vol = 0.0
            last_upd = reg.registered_at

        result.append({
            "registration_id": reg.id,
            "competition_id": reg.competition_id,
            "competition_title": reg.competition.title,
            "starting_balance": reg.starting_balance,
            "registered_at": reg.registered_at,
            "current_balance": curr_bal,
            "current_equity": curr_eq,
            "absolute_pnl": pnl,
            "roi_percentage": roi,
            "trading_volume": vol,
            "last_updated": last_upd
        })
    return result



@router.post("/{id}/register", status_code=status.HTTP_201_CREATED)
def register_for_competition(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Register the current user for a competition.
    Retrieves their initial balance/equity from Delta Exchange to set the starting point.
    """
    # 1. Verify competition exists and is active
    comp = db.query(Competition).filter(
        Competition.id == id, Competition.is_active.is_(True)).first()
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active competition not found"
        )

    # 2. Check if already registered
    existing_reg = db.query(CompetitionRegistration).filter(
        CompetitionRegistration.user_id == current_user.id,
        CompetitionRegistration.competition_id == id
    ).first()
    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already registered for this competition"
        )

    # 3. Find user's valid API Key
    # We prefer testnet keys for verification, ordering by environment desc.
    api_key_rec = db.query(APIKey).filter(
        APIKey.user_id == current_user.id,
        APIKey.is_valid.is_(True)
    ).order_by(APIKey.environment.desc()).first()

    if not api_key_rec:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid Delta Exchange API Key found. Please register an API key first."
        )

    # Decrypt API Secret
    try:
        api_secret = security.decrypt_secret(api_key_rec.encrypted_api_secret)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decrypt your API Secret."
        )

    # Fetch initial balance/equity from Delta Exchange
    client = DeltaClient(
        api_key=api_key_rec.api_key,
        api_secret=api_secret,
        environment=api_key_rec.environment
    )

    try:
        equity, balance, volume = client.get_equity_and_volume()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch initial balance from Delta Exchange: {str(e)}"
        )

    # 4. Create Competition Registration
    registration = CompetitionRegistration(
        user_id=current_user.id,
        competition_id=id,
        starting_balance=equity if equity > 0 else balance
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)

    # Create initial leaderboard snapshot
    initial_snapshot = LeaderboardSnapshot(
        registration_id=registration.id,
        current_balance=balance,
        current_equity=equity,
        absolute_pnl=0.0,
        roi_percentage=0.0,
        trading_volume=volume
    )
    db.add(initial_snapshot)
    db.commit()

    return {
        "status": "registered",
        "starting_balance": registration.starting_balance,
        "registered_at": registration.registered_at
    }


def sync_user_snapshot(registration_id: int):
    """
    Background worker helper to fetch fresh account metrics from Delta Exchange
    and update the registration's leaderboard snapshot.
    """
    db = SessionLocal()
    try:
        reg = db.query(CompetitionRegistration).filter(CompetitionRegistration.id == registration_id).first()
        if not reg:
            return

        # Find user's active API key
        api_key_rec = db.query(APIKey).filter(
            APIKey.user_id == reg.user_id,
            APIKey.is_valid.is_(True)
        ).first()

        if not api_key_rec:
            return

        # Decrypt secret
        api_secret = security.decrypt_secret(api_key_rec.encrypted_api_secret)

        # Instantiate client
        client = DeltaClient(
            api_key=api_key_rec.api_key,
            api_secret=api_secret,
            environment=api_key_rec.environment
        )

        # Fetch fresh data
        equity, balance, volume = client.get_equity_and_volume()

        # Calculate PnL and ROI
        # ROI% = ((Current Equity - Starting Balance) / Starting Balance) * 100
        absolute_pnl = equity - reg.starting_balance
        if reg.starting_balance > 0:
            roi_percentage = (absolute_pnl / reg.starting_balance) * 100.0
        else:
            roi_percentage = 0.0

        # Update or create leaderboard snapshot record
        snapshot = db.query(LeaderboardSnapshot).filter(
            LeaderboardSnapshot.registration_id == reg.id
        ).first()

        if snapshot:
            snapshot.current_balance = balance
            snapshot.current_equity = equity
            snapshot.absolute_pnl = absolute_pnl
            snapshot.roi_percentage = roi_percentage
            snapshot.trading_volume = volume
            snapshot.last_updated = datetime.utcnow()
        else:
            snapshot = LeaderboardSnapshot(
                registration_id=reg.id,
                current_balance=balance,
                current_equity=equity,
                absolute_pnl=absolute_pnl,
                roi_percentage=roi_percentage,
                trading_volume=volume
            )
            db.add(snapshot)

        db.commit()
    except Exception as e:
        # If API key has authentication issues, mark it invalid
        if "Authentication failed" in str(e):
            # Query it from current session to avoid cross-session issues
            api_key_to_invalidate = db.query(APIKey).filter(
                APIKey.user_id == reg.user_id,
                APIKey.is_valid.is_(True)
            ).first()
            if api_key_to_invalidate:
                api_key_to_invalidate.is_valid = False
                db.commit()
    finally:
        db.close()


@router.post("/{id}/sync")
def sync_competition_leaderboard(
    id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Trigger an asynchronous background synchronization of leaderboard snapshots for all participants.
    """
    comp = db.query(Competition).filter(Competition.id == id).first()
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competition not found"
        )

    registrations = db.query(CompetitionRegistration).join(User).filter(
        CompetitionRegistration.competition_id == id,
        User.is_deleted == False
    ).all()

    for reg in registrations:
        background_tasks.add_task(sync_user_snapshot, reg.id)

    return {"status": "sync_triggered", "participants_queued": len(registrations)}


@router.get("/{id}/leaderboard", response_model=LeaderboardResponse)
def get_competition_leaderboard(id: int, db: Session = Depends(get_db)):
    """
    Retrieve the sorted leaderboard entries based on participants' ROI.
    Obfuscates user details by displaying full_name.
    """
    comp = db.query(Competition).filter(Competition.id == id).first()
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competition not found"
        )

    registrations = db.query(CompetitionRegistration).join(User).filter(
        CompetitionRegistration.competition_id == id,
        User.is_deleted == False
    ).all()

    entries = []
    for reg in registrations:
        snapshot = db.query(LeaderboardSnapshot).filter(
            LeaderboardSnapshot.registration_id == reg.id
        ).first()

        if snapshot:
            roi = snapshot.roi_percentage
            pnl = snapshot.absolute_pnl
            vol = snapshot.trading_volume
            last_upd = snapshot.last_updated
        else:
            roi = 0.0
            pnl = 0.0
            vol = 0.0
            last_upd = reg.registered_at

        entries.append({
            "full_name": reg.user.full_name,
            "roi_percentage": roi,
            "absolute_pnl": pnl,
            "trading_volume": vol,
            "last_updated": last_upd
        })

    # Sort entries by ROI percentage descending
    entries.sort(key=lambda x: x["roi_percentage"], reverse=True)

    # Format entries with correct rank ordering
    leaderboard_entries = []
    for i, entry in enumerate(entries):
        leaderboard_entries.append(
            LeaderboardEntry(
                rank=i + 1,
                full_name=entry["full_name"],
                roi_percentage=entry["roi_percentage"],
                absolute_pnl=entry["absolute_pnl"],
                trading_volume=entry["trading_volume"],
                last_updated=entry["last_updated"]
            )
        )

    return LeaderboardResponse(
        competition_id=comp.id,
        title=comp.title,
        entries=leaderboard_entries
    )
