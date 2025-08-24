# backend/app/routers/invoices.py

import os
import shutil
from datetime import date
from typing import List, Dict, Set
from collections import defaultdict

from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
)
from pydantic import BaseModel
from sqlmodel import Session, select

from app import models, auth, database

router = APIRouter(prefix="/invoices", tags=["Invoices"])

UPLOAD_DIRECTORY = "uploads/invoices"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

# --- FUNKCJA POMOCNICZA DO POBIERANIA FAKTUR Z UPRAWNIENIAMI ---
def _get_invoices_for_property_with_permission_check(
    property_id: int, db: Session, current_user: models.User
) -> List[models.Invoice]:
    """
    Helper function to get invoices for a specific property after checking permissions.
    """
    db_property = db.get(models.Property, property_id)
    if not db_property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    
    is_admin = current_user.role == models.Roles.ADMIN
    is_owner = current_user.id == db_property.owner_id
    is_tenant = any(t.tenant_id == current_user.id for t in db_property.tenants)

    if not (is_admin or is_owner or is_tenant):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    return db_property.invoices

# --- ZAKTUALIZOWANE ENDPOINTY ---

@router.post("/upload", response_model=models.InvoiceRead, status_code=status.HTTP_201_CREATED)
async def upload_invoice(
    property_id: int = Form(...),
    issue_date: date = Form(...),
    description: str = Form(...),
    amount: float = Form(...),
    tags: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Sends new invoice, assigns it to a property, and links tags"""
    db_property = db.get(models.Property, property_id)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if not (current_user.role == models.Roles.ADMIN or current_user.id == db_property.owner_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    file_path = os.path.join(UPLOAD_DIRECTORY, f"{property_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_invoice = models.Invoice(
        amount=amount,
        issue_date=issue_date,
        description=description,
        file_path=file_path,
        property_id=property_id,
        uploader_id=current_user.id
    )

    tag_names = {tag.strip().lower() for tag in tags.split(",") if tag.strip()}
    if tag_names:
        existing_tags_stmt = select(models.Tag).where(models.Tag.name.in_(tag_names))
        existing_tags = db.exec(existing_tags_stmt).all()
        existing_tags_map = {tag.name: tag for tag in existing_tags}
        
        new_invoice.tags.extend(existing_tags)
        new_tag_names = tag_names - set(existing_tags_map.keys())
        
        for tag_name in new_tag_names:
            new_tag = models.Tag(name=tag_name)
            db.add(new_tag)
            new_invoice.tags.append(new_tag)

    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    
    return new_invoice

# --- NOWY ENDPOINT I MODEL DO EDYCJI TAGÓW ---
class TagsUpdateRequest(BaseModel):
    tags: str # Tagi jako string oddzielony przecinkami

@router.put("/invoices/{invoice_id}/tags", response_model=models.InvoiceRead)
def update_invoice_tags(
    invoice_id: int,
    request: TagsUpdateRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Updates tags for an existing invoice."""
    invoice = db.get(models.Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if not invoice.property:
        raise HTTPException(status_code=500, detail="Invoice is not linked to a property")

    # Uprawnienia: admin lub właściciel nieruchomości
    if not (current_user.role == models.Roles.ADMIN or current_user.id == invoice.property.owner_id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Wyczyść stare tagi
    invoice.tags.clear()

    # Logika dodawania nowych tagów (taka sama jak przy tworzeniu)
    tag_names = {tag.strip().lower() for tag in request.tags.split(",") if tag.strip()}
    if tag_names:
        existing_tags_stmt = select(models.Tag).where(models.Tag.name.in_(tag_names))
        existing_tags = db.exec(existing_tags_stmt).all()
        existing_tags_map = {tag.name: tag for tag in existing_tags}
        
        invoice.tags.extend(existing_tags)
        new_tag_names = tag_names - set(existing_tags_map.keys())
        
        for tag_name in new_tag_names:
            new_tag = models.Tag(name=tag_name)
            db.add(new_tag)
            invoice.tags.append(new_tag)
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    return invoice
# -----------------------------------------------

@router.get("/my", response_model=List[models.InvoiceRead])
def get_my_invoices(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Gets invoices for the current tenant user."""
    if current_user.role != models.Roles.TENANT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This endpoint is for tenants only")
    
    assignments_stmt = select(models.TenantAssignment).where(models.TenantAssignment.tenant_id == current_user.id)
    assignments = db.exec(assignments_stmt).all()
    if not assignments:
        return []
    
    property_ids = [a.property_id for a in assignments if a.property_id is not None]
    
    invoices_stmt = select(models.Invoice).where(models.Invoice.property_id.in_(property_ids))
    invoices = db.exec(invoices_stmt).all()
    return sorted(invoices, key=lambda inv: inv.issue_date, reverse=True)

@router.get("/property/{property_id}", response_model=List[models.InvoiceRead])
def get_invoices_for_property(
    property_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Gets invoices for a specific property with permission checks."""
    invoices = _get_invoices_for_property_with_permission_check(property_id, db, current_user)
    return sorted(invoices, key=lambda inv: inv.issue_date, reverse=True)

@router.get("/tags/property/{property_id}", response_model=List[str])
def get_tags_for_property(
    property_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Returns a list of all unique tags for a given property."""
    invoices = _get_invoices_for_property_with_permission_check(property_id, db, current_user)
    tags: Set[str] = set()
    for invoice in invoices:
        for tag in invoice.tags:
            tags.add(tag.name)
    return sorted(list(tags))

@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Removes an invoice - admin or owner only."""
    invoice = db.get(models.Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if not invoice.property:
         raise HTTPException(status_code=500, detail="Invoice is not linked to a property")

    is_admin = current_user.role == models.Roles.ADMIN
    is_owner = current_user.id == invoice.property.owner_id

    if not (is_admin or is_owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    if invoice.file_path and os.path.exists(invoice.file_path):
        os.remove(invoice.file_path)

    db.delete(invoice)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/summary/monthly/{property_id}", response_model=Dict[str, float])
def get_monthly_summary_for_property(
    property_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Returns a monthly summary of invoice amounts for a specific property."""
    invoices = _get_invoices_for_property_with_permission_check(property_id, db, current_user)
    summary = defaultdict(float)

    for inv in invoices:
        month_key = inv.issue_date.strftime("%Y-%m")
        summary[month_key] += inv.amount

    return dict(sorted(summary.items(), reverse=True))