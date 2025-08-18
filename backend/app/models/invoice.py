from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

class Invoice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    amount: float
    date: Optional[str] = None
    description: Optional[str] = None
    property_id: int = Field(foreign_key="property.id")
    file_path: Optional[str] = None

    property: Optional["Property"] = Relationship(back_populates="invoices")
