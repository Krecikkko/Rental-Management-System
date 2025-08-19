from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from app import models, auth, database, i18n
from typing import List

router = APIRouter(prefix="/properties", tags=["Properties"])

@router.get("/")
def get_all_properties(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
) -> List[models.Property]:
    if current_user.role != models.Roles.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can view all properties")
    properties = db.exec(select(models.Property)).all()
    return properties

@router.get("/{property_id}")
def get_property(
    property_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
) -> models.Property:
    property = db.get(models.Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    if current_user not in property.tenants or current_user is not property.owner_id:
        raise HTTPException(status_code=403, detail="Only users assigned to the property can view properties") 
    return property

@router.post("/add")
def add_property(
    name: str,
    address: str,
    owner_id: int | None = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.Roles.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can add properties")
    new_property = models.Property(name=name, address=address, owner_id=owner_id)
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return new_property

@router.put("/update/{property_id}")
def update_property(
    property_id: int,
    property_update: models.PropertyCreate,
    owner_id: int | None = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> models.Property:
    if current_user.role != models.Roles.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can remove properties")
    
    db_property = db.get(models.Property, property_id)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if owner_id:
        owner = db.get(models.User, property_update.owner_id)
        if not owner:
            raise HTTPException(status_code=404, detail=f"Owner with id {property_update.owner_id} not found")
        
    property_data = property_update.model_dump(exclude_unset=True)
    for key, value in property_data.items():
        setattr(db_property, key, value)

    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.delete("/remove/{property_id}")
def remove_property(
    request: Request,
    property_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    lang = i18n.get_lang(request)

    if current_user.role != models.Roles.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can remove properties")
    property = db.get(models.Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    db.delete(property)
    db.commit()
    return {"message": i18n.t("messages.password_changed", lang)}