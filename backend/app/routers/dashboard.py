# backend/app/routers/dashboard.py

from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app import models, auth, database
from typing import Dict, Any

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=Dict[str, Any])
def get_dashboard_summary(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Dostarcza podsumowanie danych do panelu głównego w zależności od roli użytkownika.
    """
    if current_user.role == models.Roles.ADMIN:
        total_users_result = db.exec(select(func.count(models.User.id))).one_or_none()
        total_properties_result = db.exec(select(func.count(models.Property.id))).one_or_none()
        total_invoices_result = db.exec(select(func.count(models.Invoice.id))).one_or_none()
        
        return {
            "total_users": total_users_result or 0,
            "total_properties": total_properties_result or 0,
            "total_invoices": total_invoices_result or 0,
        }

    if current_user.role == models.Roles.OWNER:
        owned_properties_ids = [prop.id for prop in current_user.owned_properties if prop.id is not None]
        
        total_tenants = 0
        if owned_properties_ids:
            total_tenants_result = db.exec(
                select(func.count(models.TenantAssignment.id))
                .where(models.TenantAssignment.property_id.in_(owned_properties_ids))
            ).one_or_none()
            total_tenants = total_tenants_result or 0

        total_costs = 0.0
        if owned_properties_ids:
            total_costs_result = db.exec(
                select(func.sum(models.Invoice.amount))
                .where(models.Invoice.property_id.in_(owned_properties_ids))
            ).one_or_none()
            total_costs = total_costs_result or 0.0

        return {
            "total_properties": len(owned_properties_ids),
            "total_tenants": total_tenants,
            "total_costs": total_costs,  # <-- ZMIANA Z total_income
        }

    if current_user.role == models.Roles.TENANT:
        assignments = db.exec(
            select(models.TenantAssignment)
            .where(models.TenantAssignment.tenant_id == current_user.id)
        ).all()

        property_ids = [a.property_id for a in assignments if a.property_id is not None]
        
        total_paid = 0.0
        if property_ids:
            total_paid_result = db.exec(
                select(func.sum(models.Invoice.amount))
                .where(models.Invoice.property_id.in_(property_ids))
            ).one_or_none()
            total_paid = total_paid_result or 0.0

        return {
            "active_tenancies": len(assignments),
            "total_paid": total_paid,
        }
    
    return {}