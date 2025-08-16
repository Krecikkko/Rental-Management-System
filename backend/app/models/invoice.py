from sqlalchemy import Column, Integer, ForeignKey, Float, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    data = Column(Date)
    description = Column(Text)
    property_id = Column(Integer, ForeignKey("properties.id"))
    file_path = Column(Text, nullable=True)

    property = relationship("Property", back_populates="invoices")
