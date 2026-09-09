from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.core import security
from app.models.user import User
from app.models.referred_user import ReferredUser
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    # 1. Check if Email already exists
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2. Check Delta User ID if provided
    uid_status = "pending"
    if user_in.delta_user_id:
        db_delta_user = db.query(User).filter(User.delta_user_id == user_in.delta_user_id).first()
        if db_delta_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This Delta User ID is already associated with an account."
            )
        referred_entry = db.query(ReferredUser).filter(ReferredUser.delta_user_id == user_in.delta_user_id).first()
        if referred_entry:
            referred_entry.is_registered = True
            uid_status = "verified"
        else:
            uid_status = "verified"  # Allow registration and mark verified for competition

    hashed_password = security.get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        delta_user_id=user_in.delta_user_id,
        phone=user_in.phone,
        uid_status=uid_status,
        assigned_tier="Rookie"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, retrieving an access token for subsequent authorized API calls.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account has been deactivated/deleted. Please contact support."
        )

    access_token = security.create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


from app.routers.deps import get_current_user


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get the profile of the currently logged-in user.
    """
    return current_user

