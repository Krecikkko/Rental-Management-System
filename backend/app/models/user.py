from sqlalchemy import Column, Integer, String, CheckConstraint
from sqlalchemy.orm import relationship
from ..database import Base

ALLOWED_ROLES = {"admin", "owner", "tenant"}
class Roles:
    ADMIN = "admin"
    OWNER = "owner"
    TENANT = "tenant"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="tenant")

    owned_properties = relationship("Property", back_populates="owner")
    tenant_assignments = relationship("TenantAssignment", back_populates="tenant")

    __table_args__ = (
        CheckConstraint(f"role IN {tuple(ALLOWED_ROLES)}", name="role_check"),
    )