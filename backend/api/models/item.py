# backend/api/models/item.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
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
    
    # Technical details
    technical_description = Column(String)
    use_cases = Column(JSON)  # Store as JSON array
    
    # Storage location
    level3_id = Column(Integer, ForeignKey('storage_level3.id'))
    location = relationship("StorageLevel3")
    
    # Additional metadata
    image_path = Column(String)
    notes = Column(String)
    date_added = Column(DateTime, default=datetime.utcnow)
    last_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert item to dictionary representation"""
        return {
            'id': self.id,
            'category': self.category,
            'subcategory': self.subcategory,
            'brand': self.brand,
            'model': self.model,
            'condition': self.condition,
            'technical_description': self.technical_description,
            'use_cases': self.use_cases,
            'location': {
                'shelf': self.location.container.shelf.name if self.location else None,
                'container': self.location.container.name if self.location else None,
                'compartment': self.location.name if self.location else None
            },
            'image_path': self.image_path,
            'notes': self.notes,
            'date_added': self.date_added.isoformat() if self.date_added else None,
            'last_modified': self.last_modified.isoformat() if self.last_modified else None
        }
