from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database.db import Base
import json

class ItemEmbedding(Base):
    __tablename__ = "item_embeddings"

    id = Column(Integer, primary_key=True)
    item_id = Column(Integer, ForeignKey('stored_items.id', ondelete='CASCADE'), unique=True)
    embedding_vector = Column(JSON)  # Store the embedding as JSON array instead of ARRAY
    text_content = Column(String)  # Store the text that was embedded
    model_version = Column(String)  # Store which model version created the embedding
    last_updated = Column(String)  # Timestamp of last update
    
    # Relationship to StoredItem
    item = relationship("StoredItem", back_populates="embedding")

    def set_vector(self, vector):
        """Convert numpy array to list for JSON storage"""
        if hasattr(vector, 'tolist'):  # If it's a numpy array
            self.embedding_vector = vector.tolist()
        else:
            self.embedding_vector = list(vector)

    def get_vector(self):
        """Get the vector as a list"""
        return self.embedding_vector 