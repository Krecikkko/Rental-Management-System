# backend/app/models.py

from typing import List, Optional
from datetime import date
from sqlmodel import Field, Relationship, SQLModel, CheckConstraint

# Comments are in English for consistency
class Roles:
    ADMIN = "admin"
    OWNER = "owner"
    TENANT = "tenant"
    ALL = (ADMIN, OWNER, TENANT)

# Forward declaration of the link model class
class InvoiceTagLink(SQLModel, table=True):
    __tablename__ = "invoice_tag_link"
    invoice_id: Optional[int] = Field(default=None, foreign_key="invoices.id", primary_key=True)
    tag_id: Optional[int] = Field(default=None, foreign_key="tags.id", primary_key=True)

# === Tag Models ===
class Tag(SQLModel, table=True):
    __tablename__ = "tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    invoices: List["Invoice"] = Relationship(back_populates="tags", link_model=InvoiceTagLink)

# === User Models ===
class UserBase(SQLModel):
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True, index=True)
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
    invoices: List["Invoice"] = Relationship(back_populates="uploader")


class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class UserUpdate(SQLModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

# === Property Models (częściowa definicja dla InvoiceRead) ===
class PropertyRead(SQLModel):
    id: int
    name: str
    address: str

# === Invoice Models ===
class InvoiceBase(SQLModel):
    amount: float
    issue_date: date
    description: str
    file_path: Optional[str] = None
    property_id: Optional[int] = Field(default=None, foreign_key="properties.id")
    uploader_id: int = Field(foreign_key="users.id")

class Invoice(InvoiceBase, table=True):
    __tablename__ = "invoices"
    id: Optional[int] = Field(default=None, primary_key=True)
    property: Optional["Property"] = Relationship(back_populates="invoices")
    uploader: User = Relationship(back_populates="invoices")
    tags: List[Tag] = Relationship(back_populates="invoices", link_model=InvoiceTagLink)

class InvoiceRead(InvoiceBase):
    id: int
    tags: List[Tag] = []
    property: Optional[PropertyRead] = None

class InvoiceReadWithDetails(InvoiceRead):
    uploader: UserRead

class InvoiceCreate(InvoiceBase):
    tags: str = "" # Tags as a comma-separated string

# === Pełna definicja Property Models ===
class PropertyBase(SQLModel):
    name: str = Field(index=True)
    address: str
    owner_id: Optional[int] = Field(default=None, foreign_key="users.id")

class Property(PropertyBase, table=True):
    __tablename__ = "properties"
    id: Optional[int] = Field(default=None, primary_key=True)

    owner: Optional[User] = Relationship(back_populates="owned_properties")
    invoices: List[Invoice] = Relationship(back_populates="property")
    tenants: List["TenantAssignment"] = Relationship(back_populates="property") # <-- Ta relacja nazywa się "property" w TenantAssignment

class PropertyCreate(PropertyBase):
    pass

class TenantAssignmentRead(SQLModel):
    id: int
    start_date: date
    end_date: Optional[date] = None
    tenant_id: Optional[int] = Field(default=None, foreign_key="users.id")
    property_id: Optional[int] = Field(default=None, foreign_key="properties.id")
    tenant: Optional[UserRead] = None

class PropertyReadWithDetails(PropertyRead):
    owner: Optional[UserRead] = None
    tenants: List[TenantAssignmentRead] = []

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
    # KLUCZOWA ZMIANA: back_populates musi wskazywać na "tenants" w modelu Property
    property: Optional[Property] = Relationship(back_populates="tenants")

# === API Request Models for Assignments ===
class OwnerAssignmentRequest(SQLModel):
    user_id: int

class TenantAssignmentRequest(SQLModel):
    tenant_id: int
    start_date: date
    end_date: Optional[date] = None

# --- Rebuild models to resolve forward references ---
PropertyReadWithDetails.model_rebuild()
TenantAssignmentRead.model_rebuild()
InvoiceReadWithDetails.model_rebuild()
Tag.model_rebuild()
Invoice.model_rebuild()
Property.model_rebuild()
User.model_rebuild()