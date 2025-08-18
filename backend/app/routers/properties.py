from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app import models, auth, database

router = APIRouter(prefix="/properties", tags=["Properties"])

@router.post("/add")
def add_property(
    name: str,
    address: str,
    owner_id: int | None = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.Roles.admin:
        raise HTTPException(status_code=403, detail="Only admins can add properties")
    new_property = models.Property(name=name, address=address, owner_id=owner_id)
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return new_property
