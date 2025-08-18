from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

class TenantAssignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key="user.id")
    property_id: int = Field(foreign_key="property.id")
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    tenant: Optional["User"] = Relationship(back_populates="tenant_assignments")
    property: Optional["Property"] = Relationship(back_populates="tenants")
