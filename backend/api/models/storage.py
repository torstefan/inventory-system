# backend/api/models/storage.py

from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database.db import Base
import enum

class ContainerType(enum.Enum):
    BOX = "box"
    DRAWER = "drawer"
    SHELF = "shelf"
    REGULAR_BOX = "regular_box"  # Legacy support
    DRAWER_ORGANIZER = "drawer_organizer"  # Legacy support

    @classmethod
    def migrate_legacy(cls, old_value):
        """Convert legacy container types to new ones"""
        if old_value == cls.REGULAR_BOX:
            return cls.BOX
        elif old_value == cls.DRAWER_ORGANIZER:
            return cls.DRAWER
        return old_value

class StorageLevel1(Base):
    """Represents a shelf (Level 1)"""
    __tablename__ = 'storage_level1'

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    description = Column(String)
    
    # Add back-reference to items
    items = relationship("StoredItem", back_populates="shelf")
    # Add relationship to containers
    containers = relationship("StorageLevel2", back_populates="shelf", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

class StorageLevel2(Base):
    """Represents boxes or organizers on shelves (Level 2)"""
    __tablename__ = 'storage_level2'

    id = Column(Integer, primary_key=True)
    shelf_id = Column(Integer, ForeignKey('storage_level1.id', ondelete='CASCADE'))
    name = Column(String)
    container_type = Column(Enum(ContainerType))
    description = Column(String)
    
    # Add back-reference to items
    items = relationship("StoredItem", back_populates="container")
    # Add relationship to parent shelf
    shelf = relationship("StorageLevel1", back_populates="containers")
    # Add relationship to compartments
    compartments = relationship("StorageLevel3", back_populates="container", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'shelf_id': self.shelf_id,
            'name': self.name,
            'container_type': self.container_type.value,
            'description': self.description
        }

class StorageLevel3(Base):
    """Represents compartments within boxes or drawers (Level 3)"""
    __tablename__ = 'storage_level3'

    id = Column(Integer, primary_key=True)
    container_id = Column(Integer, ForeignKey('storage_level2.id', ondelete='CASCADE'))
    name = Column(String)
    description = Column(String)
    
    # Add relationship to parent container
    container = relationship("StorageLevel2", back_populates="compartments")

    def to_dict(self):
        return {
            'id': self.id,
            'container_id': self.container_id,
            'name': self.name,
            'description': self.description
        }
