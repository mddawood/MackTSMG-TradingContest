import time
import threading
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.core import security
from app.core.config import settings
from app.core.email import send_password_reset_email, send_verification_email
from app.models.user import User
from app.models.referred_user import ReferredUser
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserProfileUpdate,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyResetTokenResponse,
)

router = APIRouter()


class ForgotPasswordRateLimiter:
    """
    Sliding window in-memory rate limiter per client IP and email address.
    Limits reset requests to max_requests within window_seconds.
    """
    def __init__(self, max_requests: int = 3, window_seconds: int = 900):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        self._requests = defaultdict(list)

    def is_allowed(self, ip: str, email: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        with self._lock:
            # Clean up expired timestamps periodically
            empty_keys = []
            for k, timestamps in self._requests.items():
                self._requests[k] = [t for t in timestamps if t > cutoff]
                if not self._requests[k]:
                    empty_keys.append(k)
            for k in empty_keys:
                del self._requests[k]

            # Check limits for IP and email
            ip_key = f"ip:{ip}"
            email_key = f"email:{email}"

            if len(self._requests[ip_key]) >= self.max_requests or len(self._requests[email_key]) >= self.max_requests:
                return False

            self._requests[ip_key].append(now)
            self._requests[email_key].append(now)
            return True


forgot_pwd_limiter = ForgotPasswordRateLimiter(max_requests=3, window_seconds=900)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    clean_email = user_in.email.strip().lower()

    # 1. Check if Email already exists (case-insensitive)
    db_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
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
        email=clean_email,
        full_name=user_in.full_name.strip(),
        hashed_password=hashed_password,
        delta_user_id=user_in.delta_user_id,
        phone=user_in.phone,
        uid_status=uid_status,
        exchange="Delta",
        is_verified=False,
        assigned_tier="Rookie"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate email verification token and send verification email via Resend
    verify_token = security.create_email_verification_token(user.id, user.email)
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verify_token}"
    send_verification_email(user.email, verify_url)

    return user


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, retrieving an access token for subsequent authorized API calls.
    Performs case-insensitive email lookup with whitespace stripping.
    """
    username_clean = form_data.username.strip() if form_data.username else ""
    user = db.query(User).filter(func.lower(User.email) == func.lower(username_clean)).first()
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
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="EMAIL_NOT_VERIFIED"
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
def forgot_password(req: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    """
    Initiate a password reset flow.
    Returns a generic message regardless of whether the user exists to prevent email enumeration.
    Protected by in-memory rate limiting (max 3 requests per 15 min per IP / email).
    """
    forwarded = request.headers.get("x-forwarded-for")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
    clean_email = req.email.strip().lower()

    if not forgot_pwd_limiter.is_allowed(client_ip, clean_email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset requests. Please wait a few minutes before trying again."
        )

    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
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

    # Anti-reuse check: verify if new password is identical to current password
    if security.verify_password(req.new_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as your previous password. Please choose a different password."
        )

    # Hash new password and update user
    user.hashed_password = security.get_password_hash(req.new_password)
    db.commit()

    return {
        "message": "Your password has been successfully reset. You can now log in."
    }


@router.post("/verify-email")
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    """
    Verify a user's email address using their token.
    """
    token_data = security.decode_email_verification_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link is invalid or has expired. Please request a new link."
        )

    user = db.query(User).filter(User.id == token_data["user_id"], User.is_deleted == False).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account not found."
        )

    if user.is_verified:
        return {
            "status": "already_verified",
            "message": "Your email address is already verified. You can log in.",
            "email": user.email
        }

    user.is_verified = True
    db.commit()
    return {
        "status": "verified",
        "message": "Email successfully verified! You can now log in to your account.",
        "email": user.email
    }


@router.post("/resend-verification")
def resend_verification(req: ResendVerificationRequest, db: Session = Depends(get_db)):
    """
    Resend email verification link.
    """
    clean_email = req.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == clean_email, User.is_deleted == False).first()
    if user and not user.is_verified:
        verify_token = security.create_email_verification_token(user.id, user.email)
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verify_token}"
        send_verification_email(user.email, verify_url)

    return {
        "message": "If an unverified account exists with that email address, a verification link has been sent."
    }


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update profile details (name, phone, exchange, and/or UID) for the currently logged-in user.
    """
    if profile_in.full_name is not None and profile_in.full_name.strip():
        current_user.full_name = profile_in.full_name.strip()

    if profile_in.phone is not None:
        current_user.phone = profile_in.phone.strip()

    if profile_in.exchange is not None and profile_in.exchange.strip():
        current_user.exchange = profile_in.exchange.strip()

    if profile_in.delta_user_id is not None:
        clean_uid = profile_in.delta_user_id.strip()
        if clean_uid:
            # Check uniqueness against other users
            existing_uid = db.query(User).filter(
                User.delta_user_id == clean_uid,
                User.id != current_user.id
            ).first()
            if existing_uid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This Exchange User ID is already linked to another account."
                )

            current_user.delta_user_id = clean_uid
            # Check if present in whitelist
            ref = db.query(ReferredUser).filter(ReferredUser.delta_user_id == clean_uid).first()
            if ref:
                ref.is_registered = True
            current_user.uid_status = "verified"
        else:
            current_user.delta_user_id = None

    db.commit()
    db.refresh(current_user)
    return current_user



