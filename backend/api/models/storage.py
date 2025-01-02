# backend/api/models/storage.py

from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database.db import Base
import enum

class ContainerType(enum.Enum):
    REGULAR_BOX = "regular_box"
    DRAWER_ORGANIZER = "drawer_organizer"

class StorageLevel1(Base):
    """Represents a shelf (Level 1)"""
    __tablename__ = 'storage_level1'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)  # e.g., "Shelf A"
    description = Column(String)
    
    # Relationship to Level 2 containers
    containers = relationship("StorageLevel2", back_populates="shelf")

class StorageLevel2(Base):
    """Represents boxes or organizers on shelves (Level 2)"""
    __tablename__ = 'storage_level2'

    id = Column(Integer, primary_key=True)
    shelf_id = Column(Integer, ForeignKey('storage_level1.id'))
    name = Column(String, nullable=False)  # e.g., "Box 1" or "Drawer Organizer 1"
    container_type = Column(Enum(ContainerType))
    description = Column(String)
    
    # Relationships
    shelf = relationship("StorageLevel1", back_populates="containers")
    compartments = relationship("StorageLevel3", back_populates="container")

class StorageLevel3(Base):
    """Represents compartments within boxes or drawers (Level 3)"""
    __tablename__ = 'storage_level3'

    id = Column(Integer, primary_key=True)
    container_id = Column(Integer, ForeignKey('storage_level2.id'))
    name = Column(String, nullable=False)  # e.g., "Compartment A" or "Drawer 1"
    description = Column(String)
    
    # Relationship to parent container
    container = relationship("StorageLevel2", back_populates="compartments")

# backend/api/models/item.py

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