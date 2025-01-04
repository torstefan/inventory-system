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
    
    # Technical details as JSON to support flexible structure
    technical_details = Column(JSON)
    
    # Storage location relationships
    shelf_id = Column(Integer, ForeignKey('storage_level1.id'))
    container_id = Column(Integer, ForeignKey('storage_level2.id'))
    
    # Relationships
    shelf = relationship("StorageLevel1")
    container = relationship("StorageLevel2")
    
    # Additional metadata
    image_path = Column(String)
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
            'technical_details': self.technical_details,
            'location': {
                'shelf': self.shelf.name if self.shelf else None,
                'container': self.container.name if self.container else None
            },
            'image_path': self.image_path,
            'date_added': self.date_added.isoformat() if self.date_added else None,
            'last_modified': self.last_modified.isoformat() if self.last_modified else None
        }