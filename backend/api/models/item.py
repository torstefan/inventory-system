# backend/api/models/item.py
from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime
from .embedding import ItemEmbedding

class StoredItem(Base):
    __tablename__ = 'stored_items'

    id = Column(Integer, primary_key=True)
    category = Column(String, nullable=False)
    subcategory = Column(String)
    brand = Column(String)
    model = Column(String)
    condition = Column(String)
    technical_details = Column(JSON)
    
    shelf_id = Column(Integer, ForeignKey('storage_level1.id', ondelete='SET NULL'), nullable=True)
    container_id = Column(Integer, ForeignKey('storage_level2.id', ondelete='SET NULL'), nullable=True)
    
    shelf = relationship("StorageLevel1", back_populates="items")
    container = relationship("StorageLevel2", back_populates="items")
    
    image_path = Column(String)
    date_added = Column(DateTime, default=datetime.utcnow)
    last_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    embedding = relationship("ItemEmbedding", back_populates="item", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        """Convert item to dictionary representation"""
        location_data = {
            'shelf': None,
            'container': None
        }
        
        # Explicitly check for shelf and container relationships
        if self.shelf_id and self.shelf:
            location_data['shelf'] = self.shelf.name
            
        if self.container_id and self.container:
            location_data['container'] = self.container.name

        return {
            'id': self.id,
            'category': self.category,
            'subcategory': self.subcategory,
            'brand': self.brand,
            'model': self.model,
            'condition': self.condition,
            'technical_details': self.technical_details,
            'location': location_data,
            'image_path': self.image_path,
            'date_added': self.date_added.isoformat() if self.date_added else None,
            'last_modified': self.last_modified.isoformat() if self.last_modified else None
        }