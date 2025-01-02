# backend/api/models/item.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class StoredItem(Base):
    """Represents items stored in the system"""
    __tablename__ = 'stored_items'

    id = Column(Integer, primary_key=True)
    category = Column(String, nullable=False)
    subcategory = Column(String)
    brand = Column(String)
    model = Column(String)
    condition = Column(String)
    
    # Storage location
    level3_id = Column(Integer, ForeignKey('storage_level3.id'))
    location = relationship("StorageLevel3")
    
    # Additional metadata
    image_path = Column(String)
    notes = Column(String)
    date_added = Column(DateTime, default=datetime.utcnow)
    last_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
