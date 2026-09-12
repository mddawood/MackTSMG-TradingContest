from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.core import security
from app.core.config import settings
from app.core.email import send_password_reset_email
from app.models.user import User
from app.models.referred_user import ReferredUser
from app.schemas.user import (
    UserCreate,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyResetTokenResponse,
)

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


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiate a password reset flow.
    Returns a generic message regardless of whether the user exists to prevent email enumeration.
    """
    user = db.query(User).filter(func.lower(User.email) == func.lower(req.email.strip())).first()
    if user and not user.is_deleted:
        reset_token = security.create_password_reset_token(user.id, user.hashed_password)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        send_password_reset_email(user.email, reset_url)

    return {
        "message": "If an account exists with that email address, a password reset link has been sent."
    }


@router.get("/verify-reset-token", response_model=VerifyResetTokenResponse)
def verify_reset_token(token: str = Query(...), db: Session = Depends(get_db)):
    """
    Verify whether a reset token is valid, unexpired, and hasn't already been used.
    """
    user_id = security.decode_password_reset_token_sub(token)
    if not user_id:
        return VerifyResetTokenResponse(valid=False, detail="Reset link is invalid or has expired.")

    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        return VerifyResetTokenResponse(valid=False, detail="User not found or account deactivated.")

    verified_id = security.verify_password_reset_token(token, user.hashed_password)
    if not verified_id:
        return VerifyResetTokenResponse(valid=False, detail="This reset link is invalid or has already been used.")

    return VerifyResetTokenResponse(valid=True, email=user.email)


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset the user's password using a valid reset token.
    """
    user_id = security.decode_password_reset_token_sub(req.token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link is invalid or has expired."
        )

    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found or account deactivated."
        )

    verified_id = security.verify_password_reset_token(req.token, user.hashed_password)
    if not verified_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link has already been used or has expired. Please request a new link."
        )

    # Hash new password and update user
    user.hashed_password = security.get_password_hash(req.new_password)
    db.commit()

    return {
        "message": "Your password has been successfully reset. You can now log in."
    }


