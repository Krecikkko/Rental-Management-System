from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
import enum

class Roles(str, enum.Enum):
    admin = "admin"
    owner = "owner"
    tenant = "tenant"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    hashed_password: str
    role: Roles = Roles.tenant

    owned_properties: List["Property"] = Relationship(back_populates="owner")
    tenant_assignments: List["TenantAssignment"] = Relationship(back_populates="tenant")
