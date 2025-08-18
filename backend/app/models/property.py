from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class Property(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    address: str
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")

    owner: Optional["User"] = Relationship(back_populates="owned_properties")
    tenants: List["TenantAssignment"] = Relationship(back_populates="property")
    invoices: List["Invoice"] = Relationship(back_populates="property")
