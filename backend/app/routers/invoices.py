import os
import shutil
from datetime import date
from typing import List, Dict
from collections import defaultdict

from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
)
from sqlmodel import Session, select

from app import models, auth, database

router = APIRouter(prefix="/invoices", tags=["Invoices"])

UPLOAD_DIRECTORY = "..../uploads/invoices"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.post("/upload", response_model=models.InvoiceRead, status_code=status.HTTP_201_CREATED)
async def upload_invoice(
    property_id: int = Form(...),
    issue_date: date = Form(...),
    description: str = Form(...),
    amount: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    '''Sends new invoice and assigns it to property'''
    db_property = db.get(models.Property, property_id)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Only admin or owner can add invoices
    if not (current_user.role == models.Roles.ADMIN or current_user.id == db_property.owner_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    # Save file on server
    file_path = os.path.join(UPLOAD_DIRECTORY, f"{property_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_invoice = models.Invoice(
        amount = amount,
        issue_date = issue_date,
        description = description,
        file_path = file_path,
        property_id = property_id,
        uploader_id = current_user.id
    )

    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return new_invoice

@router.get("/property/{property_id}", response_model=List[models.InvoiceReadWithDetails])
def get_invoices_for_property(
    property_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_property = db.get(models.Property, property_id)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Permissions
    is_admin = current_user.role = models.Roles.ADMIN
    is_owner = current_user.id == db_property.owner_id
    is_tenant = any(t.tenant_id == current_user.id for t in db_property.tenants)

    if not (is_admin or is_owner or is_tenant):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    return db_property.invoices

@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    '''Remove invoice - admin or owner'''
    invoice = db.get(models.Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    is_admin = current_user.role == models.Roles.ADMIN
    is_owner = current_user.id == invoice.property.owner_id

    if not (is_admin or is_owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    # Usuń plik fizycznie
    if invoice.file_path and os.path.exists(invoice.file_path):
        os.remove(invoice.file_path)

    db.delete(invoice)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/summary/monthly", response_model=Dict[str, float])
def get_monthly_summary(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Zwraca miesięczne podsumowanie kwot z faktur (tylko dla admina)."""
    if current_user.role != models.Roles.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    invoices = db.exec(select(models.Invoice)).all()
    summary = defaultdict(float)

    for inv in invoices:
        month_key = inv.issue_date.strftime("%Y-%m")
        summary[month_key] += inv.amount

    return dict(sorted(summary.items()))