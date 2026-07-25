from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User
from app.models.api_key import APIKey
from app.schemas.api_key import APIKeyCreate, APIKeyResponse
from app.core.delta_client import DeltaClient
from app.core import security

router = APIRouter()


@router.post("/", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    key_in: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Register a Delta Exchange API key.
    Validates credentials with Delta Exchange before saving.
    Encrypted secret is stored securely.
    """
    # Validate environment value
    if key_in.environment not in ["testnet", "mainnet", "testnet_india", "mainnet_india"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Environment must be one of: 'testnet', 'mainnet', 'testnet_india', or 'mainnet_india'"
        )

    # 1. Instantiate DeltaClient and verify key validity on Delta Exchange
    client = DeltaClient(
        api_key=key_in.api_key,
        api_secret=key_in.api_secret,
        environment=key_in.environment
    )

    try:
        client.get_profile()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not validate key with Delta Exchange: {str(e)}"
        )

    # 2. Encrypt api secret
    encrypted_secret = security.encrypt_secret(key_in.api_secret)

    # 3. Check if key already exists for this user and environment
    db_key = db.query(APIKey).filter(
        APIKey.user_id == current_user.id,
        APIKey.environment == key_in.environment
    ).first()

    if db_key:
        # Update existing key
        db_key.api_key = key_in.api_key
        db_key.encrypted_api_secret = encrypted_secret
        db_key.is_valid = True
    else:
        # Create new key
        db_key = APIKey(
            user_id=current_user.id,
            api_key=key_in.api_key,
            encrypted_api_secret=encrypted_secret,
            environment=key_in.environment,
            is_valid=True
        )
        db.add(db_key)

    db.commit()
    db.refresh(db_key)
    return db_key


@router.get("/", response_model=List[APIKeyResponse])
def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all Delta Exchange API keys for the current user.
    """
    return db.query(APIKey).filter(APIKey.user_id == current_user.id).all()


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a registered API key.
    """
    db_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id
    ).first()

    if not db_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Key not found"
        )

    db.delete(db_key)
    db.commit()
    return
