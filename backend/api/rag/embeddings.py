from typing import List, Dict, Any
import numpy as np
from sqlalchemy.orm import Session
from ..models.item import StoredItem
from ..models.storage import StorageLevel1, StorageLevel2
from openai import AsyncOpenAI
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class InventoryEmbeddingManager:
    def __init__(self):
        self.embedding_model = "text-embedding-3-small"
        self.async_client = AsyncOpenAI()

    def generate_item_text(self, item: StoredItem, storage: Dict = None) -> str:
        """Generate text description for an item"""
        parts = []
        
        # Add basic item information
        if item.category:
            parts.append(f"Category: {item.category}")
        if item.subcategory:
            parts.append(f"Subcategory: {item.subcategory}")
        if item.brand:
            parts.append(f"Brand: {item.brand}")
        if item.model:
            parts.append(f"Model: {item.model}")
            
        # Add technical details
        if item.technical_details:
            parts.append(f"Technical Details: {item.technical_details}")
        
        # Add storage location
        if storage:
            location_parts = []
            if storage.get('shelf'):
                shelf = storage['shelf']  # This is a StorageLevel1 object
                location_parts.append(shelf.name)  # Access the name directly
            if storage.get('container'):
                container = storage['container']  # This is a StorageLevel2 object
                location_parts.append(container.name)  # Access the name directly
            if location_parts:
                parts.append(f"Location: {' - '.join(location_parts)}")
        
        return "\n".join(parts)

    async def create_embeddings(self, db: Session) -> List[Dict[str, Any]]:
        """Create embeddings for all items"""
        try:
            # Get all items with their storage locations
            items = db.query(StoredItem).all()
            embeddings_data = []
            
            # Process items in batches
            batch_size = 10
            for i in range(0, len(items), batch_size):
                batch = items[i:i + batch_size]
                
                # Get storage locations for batch
                storage_locations = {}
                for item in batch:
                    if item.shelf_id:
                        shelf = db.query(StorageLevel1).filter_by(id=item.shelf_id).first()
                        container = None
                        if item.container_id:
                            container = db.query(StorageLevel2).filter_by(id=item.container_id).first()
                        storage_locations[item.shelf_id] = {
                            'shelf': shelf,  # Store the actual model objects
                            'container': container
                        }
                
                # Generate text and get embeddings for batch
                batch_texts = []
                for item in batch:
                    storage = storage_locations.get(item.shelf_id)
                    text = self.generate_item_text(item, storage)
                    batch_texts.append(text)
                
                # Get embeddings for batch
                response = await self.async_client.embeddings.create(
                    input=batch_texts,
                    model=self.embedding_model
                )
                
                # Process response
                for item, text, embedding_data in zip(batch, batch_texts, response.data):
                    embeddings_data.append({
                        "item_id": item.id,
                        "embedding": embedding_data.embedding,
                        "text": text
                    })
                
                logger.debug(f"Processed batch of {len(batch)} items")
            
            logger.info(f"Successfully created embeddings for {len(embeddings_data)} items")
            return embeddings_data
            
        except Exception as e:
            logger.error(f"Error creating embeddings: {str(e)}")
            raise 