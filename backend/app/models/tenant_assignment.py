from sqlalchemy import Column, Integer, String, ForeignKey, Float, Date, Text
from sqlalchemy.orm import relationship
from ..database import Base

class TenantAssignment(Base):
    __tablename__ = "tenant_assignments"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"))
    property_id = Column(Integer, ForeignKey("properties.id"))

    tenant = relationship("User", back_populates="tenant_assignments")
    property = relationship("Property", back_populates="tenants")