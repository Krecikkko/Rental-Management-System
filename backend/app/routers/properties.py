# backend/app/routers/properties.py

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session, select
from typing import List
from app import models, auth, database

# Importujemy zależność admina z routera użytkowników
from .users import get_admin_user

router = APIRouter(prefix="/properties", tags=["Properties"])

@router.get("/", response_model=List[models.PropertyRead])
def get_properties(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Gets a list of all properties for an admin, or a list of owned properties for an owner.
    """
    if current_user.role == models.Roles.ADMIN:
        return db.exec(select(models.Property)).all()
    
    if current_user.role == models.Roles.OWNER:
        return current_user.owned_properties
    
    # Tenants and other roles are denied access
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to view this list of properties"
    )

@router.get("/{property_id}", response_model=models.PropertyReadWithDetails)
def get_property(
    property_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retrieves a single property.
    Access is granted to the property's owner, assigned tenants, and admins.
    """
    db_property = db.get(models.Property, property_id)
    if not db_property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    is_admin = current_user.role == models.Roles.ADMIN
    is_owner = current_user.id == db_property.owner_id
    is_tenant = any(assignment.tenant_id == current_user.id for assignment in db_property.tenants)

    if not (is_admin or is_owner or is_tenant):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to view this property")
    
    return db_property

# Admin-only endpoints remain unchanged for creating, updating, and deleting properties
@router.post("/add", response_model=models.PropertyRead, status_code=status.HTTP_201_CREATED)
def add_property(
    property_create: models.PropertyCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_admin_user)
):
    if property_create.owner_id:
        owner = db.get(models.User, property_create.owner_id)
        if not owner or owner.role != models.Roles.OWNER:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid owner ID or user is not an owner")
            
    new_property = models.Property.model_validate(property_create)
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return new_property

@router.put("/update/{property_id}", response_model=models.PropertyRead)
def update_property(
    property_id: int,
    property_update: models.PropertyCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_admin_user)
):
    db_property = db.get(models.Property, property_id)
    if not db_property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    update_data = property_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_property, key, value)
    
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.delete("/remove/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_property(
    property_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_admin_user)
):
    property_to_delete = db.get(models.Property, property_id)
    if not property_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        
    db.delete(property_to_delete)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)