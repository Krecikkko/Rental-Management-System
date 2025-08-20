from typing import List, Optional
from datetime import date
from sqlmodel import Field, Relationship, SQLModel, CheckConstraint

# Comments are in English for consistency
class Roles:
    ADMIN = "admin"
    OWNER = "owner"
    TENANT = "tenant"
    ALL = (ADMIN, OWNER, TENANT)

# === User Models ===

class UserBase(SQLModel):
    username: str = Field(index=True, unique=True)
    role: str = Field(default=Roles.TENANT)

class User(UserBase, table=True):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(f"role IN {Roles.ALL}", name="role_check"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

    owned_properties: List["Property"] = Relationship(back_populates="owner")
    tenant_assignments: List["TenantAssignment"] = Relationship(back_populates="tenant")

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class UserUpdate(SQLModel):
    username: Optional[str] = None
    role: Optional[str] = None

# === Property Models ===

class PropertyBase(SQLModel):
    name: str = Field(index=True)
    address: str
    owner_id: Optional[int] = Field(default=None, foreign_key="users.id")

class Property(PropertyBase, table=True):
    __tablename__ = "properties"
    id: Optional[int] = Field(default=None, primary_key=True)

    owner: Optional[User] = Relationship(back_populates="owned_properties")
    invoices: List["Invoice"] = Relationship(back_populates="property")
    tenants: List["TenantAssignment"] = Relationship(back_populates="property")

class PropertyCreate(PropertyBase):
    pass

class PropertyRead(PropertyBase):
    id: int

class PropertyReadWithDetails(PropertyRead):
    owner: Optional[UserRead] = None
    tenants: List["TenantAssignmentRead"] = []


# === Invoice Models ===

class InvoiceBase(SQLModel):
    amount: float
    data: date
    description: str
    file_path: Optional[str] = None
    property_id: Optional[int] = Field(default=None, foreign_key="properties.id")

class Invoice(InvoiceBase, table=True):
    __tablename__ = "invoices"
    id: Optional[int] = Field(default=None, primary_key=True)
    property: Optional[Property] = Relationship(back_populates="invoices")

class InvoiceRead(InvoiceBase):
    id: int

# === Tenant Assignment Models ===

class TenantAssignmentBase(SQLModel):
    start_date: date
    end_date: Optional[date] = None
    tenant_id: Optional[int] = Field(default=None, foreign_key="users.id")
    property_id: Optional[int] = Field(default=None, foreign_key="properties.id")

class TenantAssignment(TenantAssignmentBase, table=True):
    __tablename__ = "tenant_assignments"
    id: Optional[int] = Field(default=None, primary_key=True)

    tenant: Optional[User] = Relationship(back_populates="tenant_assignments")
    property: Optional[Property] = Relationship(back_populates="tenants")

class TenantAssignmentRead(TenantAssignmentBase):
    id: int
    # To include tenant info in the response, we can add this relationship
    tenant: Optional[UserRead] = None


# === API Request Models for Assignments ===

class OwnerAssignmentRequest(SQLModel): # <-- Fixed typo from "Owneer"
    user_id: int

class TenantAssignmentRequest(SQLModel):
    tenant_id: int
    start_date: date
    end_date: Optional[date] = None

# ====================================================================
#  FIX: Move model_rebuild to the end of the file
#  This ensures all models are defined before Pydantic tries to
#  resolve the forward references (string type hints).
# ====================================================================

PropertyReadWithDetails.model_rebuild()
TenantAssignmentRead.model_rebuild()