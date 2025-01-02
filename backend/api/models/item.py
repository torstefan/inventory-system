from datetime import datetime
from backend.database.db import Base
from sqlalchemy import Column, Integer, String, JSON, DateTime

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True)
    category = Column(String)
    subcategory = Column(String)
    properties = Column(JSON)
    location = Column(JSON)
    image_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'subcategory': self.subcategory,
            'properties': self.properties,
            'location': self.location,
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat()
        }