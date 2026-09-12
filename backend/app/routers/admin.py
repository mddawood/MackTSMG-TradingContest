import csv
import io
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.routers.deps import get_current_admin
from app.models.user import User
from app.models.api_key import APIKey
from app.models.competition import Competition
from app.models.registration import CompetitionRegistration
from app.models.referred_user import ReferredUser

router = APIRouter()


@router.get("/stats")
def get_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_deleted == False).count()
    deleted_users = db.query(User).filter(User.is_deleted == True).count()
    total_registrations = db.query(CompetitionRegistration).count()
    total_api_keys = db.query(APIKey).count()
    valid_api_keys = db.query(APIKey).filter(APIKey.is_valid == True).count()
    total_competitions = db.query(Competition).count()
    active_competitions = db.query(Competition).filter(Competition.is_active == True).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "deleted_users": deleted_users,
        "total_registrations": total_registrations,
        "total_api_keys": total_api_keys,
        "valid_api_keys": valid_api_keys,
        "total_competitions": total_competitions,
        "active_competitions": active_competitions
    }


@router.get("/users")
def list_users(
    q: str = None,
    page: int = 1,
    limit: int = 10,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if q:
        query = query.filter(
            (User.full_name.ilike(f"%{q}%")) | (User.email.ilike(f"%{q}%"))
        )
    total = query.count()
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()
    
    result = []
    for user in users:
        api_keys_info = []
        for key in user.api_keys:
            api_keys_info.append({
                "id": key.id,
                "api_key": key.api_key[:8] + "..." + key.api_key[-4:] if len(key.api_key) > 12 else key.api_key,
                "environment": key.environment,
                "is_valid": key.is_valid
            })
        
        result.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_deleted": user.is_deleted,
            "created_at": user.created_at,
            "registration_count": len(user.registrations),
            "api_keys": api_keys_info
        })
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "users": result
    }


@router.post("/users/{user_id}/soft-delete")
def soft_delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot soft delete your own admin account."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_deleted = True
    db.commit()
    return {"status": "success", "message": f"User {user.email} soft deleted successfully."}


@router.post("/users/{user_id}/restore")
def restore_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_deleted = False
    db.commit()
    return {"status": "success", "message": f"User {user.email} restored successfully."}


@router.delete("/users/{user_id}/hard-delete")
def hard_delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot permanently delete your own admin account."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return {"status": "success", "message": "User and all their records permanently deleted."}


@router.post("/users/{user_id}/promote")
def promote_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = "admin"
    db.commit()
    return {"status": "success", "message": f"User {user.email} promoted to Admin."}


@router.get("/competitions")
def list_competitions_admin(
    q: str = None,
    page: int = 1,
    limit: int = 10,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Competition)
    if q:
        query = query.filter(
            (Competition.title.ilike(f"%{q}%")) | (Competition.description.ilike(f"%{q}%"))
        )
    total = query.count()
    offset = (page - 1) * limit
    comps = query.order_by(Competition.created_at.desc()).offset(offset).limit(limit).all()
    
    result = []
    for comp in comps:
        result.append({
            "id": comp.id,
            "title": comp.title,
            "description": comp.description,
            "start_time": (comp.start_time.isoformat() + "Z" if comp.start_time and comp.start_time.tzinfo is None else comp.start_time.isoformat()) if comp.start_time else None,
            "end_time": (comp.end_time.isoformat() + "Z" if comp.end_time and comp.end_time.tzinfo is None else comp.end_time.isoformat()) if comp.end_time else None,
            "is_active": comp.is_active,
            "registration_count": len(comp.registrations)
        })
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "competitions": result
    }


@router.post("/competitions/{comp_id}/toggle-active")
def toggle_competition_active(
    comp_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    comp = db.query(Competition).filter(Competition.id == comp_id).first()
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competition not found"
        )
    comp.is_active = not comp.is_active
    db.commit()
    status_str = "active" if comp.is_active else "inactive"
    return {"status": "success", "message": f"Competition is now {status_str}."}


@router.delete("/competitions/{comp_id}/delete")
def delete_competition(
    comp_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    comp = db.query(Competition).filter(Competition.id == comp_id).first()
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competition not found"
        )
    db.delete(comp)
    db.commit()
    return {"status": "success", "message": "Competition deleted successfully."}


# --------------------
# Referred Users Whitelist Endpoints
# --------------------

@router.get("/referred-users")
def list_referred_users(
    q: str = None,
    page: int = 1,
    limit: int = 10,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(ReferredUser)
    if q:
        query = query.filter(ReferredUser.delta_user_id.ilike(f"%{q}%"))
    
    total = query.count()
    offset = (page - 1) * limit
    users = query.order_by(ReferredUser.added_at.desc()).offset(offset).limit(limit).all()
    
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "delta_user_id": u.delta_user_id,
            "is_registered": u.is_registered,
            "added_at": u.added_at
        })
        
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "referred_users": result
    }


@router.post("/referred-users")
def add_referred_user(
    delta_user_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    delta_user_id = delta_user_id.strip()
    if not delta_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Delta User ID cannot be empty."
        )
        
    existing = db.query(ReferredUser).filter(ReferredUser.delta_user_id == delta_user_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This Delta User ID is already in the whitelist."
        )
        
    new_ref = ReferredUser(delta_user_id=delta_user_id)
    db.add(new_ref)
    db.commit()
    db.refresh(new_ref)
    return {"status": "success", "message": f"Successfully added {delta_user_id} to whitelist."}


@router.delete("/referred-users/{delta_user_id}")
def delete_referred_user(
    delta_user_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ref = db.query(ReferredUser).filter(ReferredUser.delta_user_id == delta_user_id).first()
    if not ref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delta User ID not found in whitelist."
        )
        
    if ref.is_registered:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove a registered user from the whitelist."
        )
        
    db.delete(ref)
    db.commit()
    return {"status": "success", "message": f"Successfully removed {delta_user_id} from whitelist."}


@router.post("/referred-users/upload")
def upload_referred_users(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        raw_bytes = file.file.read()
        if not raw_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty."
            )

        try:
            content = raw_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            content = raw_bytes.decode("latin-1")

        reader = csv.reader(io.StringIO(content))
        raw_rows = [row for row in reader if row and any(cell.strip() for cell in row)]

        if not raw_rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No readable rows found in the CSV file."
            )

        # Detect header row and column index
        first_row = [cell.strip().lower() for cell in raw_rows[0]]
        known_headers = {
            "user_id", "userid", "user id", "delta_user_id",
            "delta userid", "delta user id", "id", "uid", "account_id", "delta_id"
        }

        target_col_idx = 0
        has_header = False

        for idx, col in enumerate(first_row):
            normalized_col = col.replace("-", "_").replace(" ", "_")
            if normalized_col in known_headers or "user_id" in normalized_col or "delta" in normalized_col:
                target_col_idx = idx
                has_header = True
                break

        # If the first row contains common non-numeric header text even if not explicitly matched
        if not has_header and any(h in first_row[0] for h in ["user", "id", "delta", "email", "name", "account"]):
            has_header = True

        data_rows = raw_rows[1:] if has_header else raw_rows

        extracted_uids = []
        for row in data_rows:
            if target_col_idx < len(row):
                val = row[target_col_idx].strip().strip('"\'')
                # Ignore empty strings or accidental repeat headers
                if not val or val.lower() in known_headers:
                    continue
                extracted_uids.append(val)

        if not extracted_uids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid user IDs found in the uploaded CSV file."
            )

        # Deduplicate within the uploaded file while preserving order
        unique_uids = []
        seen_in_batch = set()
        for uid in extracted_uids:
            if uid not in seen_in_batch:
                seen_in_batch.add(uid)
                unique_uids.append(uid)

        file_internal_duplicates = len(extracted_uids) - len(unique_uids)

        # Batch check against DB
        existing_in_db = set()
        chunk_size = 500
        for i in range(0, len(unique_uids), chunk_size):
            chunk = unique_uids[i : i + chunk_size]
            matched = db.query(ReferredUser.delta_user_id).filter(ReferredUser.delta_user_id.in_(chunk)).all()
            for m in matched:
                existing_in_db.add(m[0])

        new_users_to_add = []
        db_duplicates = 0

        for uid in unique_uids:
            if uid in existing_in_db:
                db_duplicates += 1
            else:
                new_users_to_add.append(ReferredUser(delta_user_id=uid))

        if new_users_to_add:
            db.add_all(new_users_to_add)
            db.commit()

        added_count = len(new_users_to_add)
        skipped_count = file_internal_duplicates + db_duplicates

        return {
            "status": "success",
            "message": f"Successfully imported {added_count} user IDs. Skipped {skipped_count} duplicates.",
            "added_count": added_count,
            "skipped_count": skipped_count,
            "total_processed": len(extracted_uids)
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV file: {str(e)}"
        )
