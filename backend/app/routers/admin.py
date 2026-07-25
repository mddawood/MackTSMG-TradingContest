from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.routers.deps import get_current_admin
from app.models.user import User
from app.models.api_key import APIKey
from app.models.competition import Competition
from app.models.registration import CompetitionRegistration

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
            "start_time": comp.start_time,
            "end_time": comp.end_time,
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
