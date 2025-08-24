# backend/app/routers/tags.py

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session, select
from typing import List
from app import models, database, auth

# Import zależności admina
from .users import get_admin_user

router = APIRouter(prefix="/tags", tags=["Tags"])

@router.get("/", response_model=List[models.Tag])
def get_all_tags(
    db: Session = Depends(database.get_db),
    # Dostęp może mieć każdy zalogowany użytkownik, aby pobrać listę
    current_user: models.User = Depends(auth.get_current_user)
):
    """Gets a list of all tags."""
    tags = db.exec(select(models.Tag).order_by(models.Tag.name)).all()
    return tags

@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_admin_user) # Tylko admin może usuwać
):
    """Deletes a tag (admin only). The tag will be unlinked from all invoices."""
    tag_to_delete = db.get(models.Tag, tag_id)
    if not tag_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    
    # SQLModel automatycznie usunie powiązania z tabeli `InvoiceTagLink`
    db.delete(tag_to_delete)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)