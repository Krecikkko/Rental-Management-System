# backend/app/routers/assignments.py

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session, select
from app import models, database, auth

# Używamy tej samej zależności, co w routerze użytkowników
from .users import get_admin_user

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.put("/properties/{property_id}/owner", response_model=models.PropertyReadWithDetails)
def assign_owner_to_property(
    property_id: int,
    assignment_request: models.OwnerAssignmentRequest,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_admin_user)
):
    """Assigns a user with the 'owner' role to a property. Admin only."""
    db_property = db.get(models.Property, property_id)
    if not db_property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    user_to_assign = db.get(models.User, assignment_request.user_id)
    if not user_to_assign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User to assign not found")

    if user_to_assign.role != models.Roles.OWNER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must have the 'owner' role to be assigned")

    db_property.owner_id = user_to_assign.id
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property


@router.post("/properties/{property_id}/tenants", response_model=models.TenantAssignmentRead, status_code=status.HTTP_201_CREATED)
def assign_tenant_to_property(
    property_id: int,
    assignment_request: models.TenantAssignmentRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Assigns a user with the 'tenant' role to a property. Admin or property owner only."""
    db_property = db.get(models.Property, property_id)
    if not db_property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    if current_user.role != models.Roles.ADMIN and db_property.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    user_to_assign = db.get(models.User, assignment_request.tenant_id)
    if not user_to_assign or user_to_assign.role != models.Roles.TENANT:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant to assign not found or user is not a tenant")

    existing_assignment = db.exec(
        select(models.TenantAssignment).where(
            models.TenantAssignment.property_id == property_id,
            models.TenantAssignment.tenant_id == user_to_assign.id
        )
    ).first()
    if existing_assignment:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This tenant is already assigned to this property")

    new_assignment = models.TenantAssignment.model_validate(assignment_request, update={"property_id": property_id})
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

@router.delete("/tenants/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def unassign_tenant_from_property(
    assignment_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Removes a tenant assignment. Admin or property owner only."""
    assignment_to_delete = db.get(models.TenantAssignment, assignment_id)
    if not assignment_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    if current_user.role != models.Roles.ADMIN and assignment_to_delete.property.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    db.delete(assignment_to_delete)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)