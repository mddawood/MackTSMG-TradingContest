from datetime import datetime, timedelta
from typing import Any, Union, Optional
import base64
import hashlib
from jose import jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet

from app.core.config import settings

# Setup password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Derive a standard, valid Fernet key from settings.ENCRYPTION_KEY string
# SHA-256 produces a 32-byte digest which is suitable for Fernet
key_hash = hashlib.sha256(settings.ENCRYPTION_KEY.encode()).digest()
fernet_key = base64.urlsafe_b64encode(key_hash)
fernet = Fernet(fernet_key)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a password hash from a plain text password"""
    return pwd_context.hash(password)


def create_access_token(subject: Union[str, Any], role: str, expires_delta: timedelta = None) -> str:
    """Create a signed JWT access token, embedding user role for RBAC."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_password_reset_token(user_id: int, current_pwd_hash: str) -> str:
    """
    Create a signed JWT token specifically for password reset.
    Embeds a 16-character SHA-256 fingerprint of the user's current password hash.
    Expires in 15 minutes.
    """
    expire = datetime.utcnow() + timedelta(minutes=15)
    pwd_fingerprint = hashlib.sha256(current_pwd_hash.encode("utf-8")).hexdigest()[:16]
    to_encode = {
        "exp": expire,
        "sub": str(user_id),
        "type": "password_reset",
        "pwd_fingerprint": pwd_fingerprint
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_password_reset_token_sub(token: str) -> Optional[int]:
    """
    Decode password reset token without fingerprint verification to extract user_id.
    Returns None if signature is invalid, token is expired, or token type is not password_reset.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "password_reset":
            return None
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except (jwt.JWTError, ValueError, TypeError):
        return None


def verify_password_reset_token(token: str, current_pwd_hash: str) -> Optional[int]:
    """
    Verify that the password reset token is valid, unexpired, and matches the user's current password hash fingerprint.
    Returns user_id if valid, otherwise None.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "password_reset":
            return None
        expected_fingerprint = hashlib.sha256(current_pwd_hash.encode("utf-8")).hexdigest()[:16]
        if payload.get("pwd_fingerprint") != expected_fingerprint:
            return None
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except (jwt.JWTError, ValueError, TypeError):
        return None


def encrypt_secret(secret: str) -> str:
    """Encrypt a secret string (e.g., Delta API Secret)"""
    return fernet.encrypt(secret.encode()).decode()


def decrypt_secret(encrypted_secret: str) -> str:
    """Decrypt an encrypted secret string"""
    return fernet.decrypt(encrypted_secret.encode()).decode()
