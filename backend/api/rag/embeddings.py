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
            
        # Add technical details if available
        if item.technical_details:
            if 'description' in item.technical_details:
                parts.append(f"Description: {item.technical_details['description']}")
            if 'use_cases' in item.technical_details:
                parts.append(f"Use Cases: {', '.join(item.technical_details['use_cases'])}")
                
        # Add storage location if available
        if storage:
            parts.append(f"Location: {storage.get('shelf_name', '')} - {storage.get('container_name', '')}")
            
        return " | ".join(parts)

    async def create_embeddings(self, db: Session) -> List[Dict[str, Any]]:
        """Create or update embeddings for all items in the database"""
        try:
            logger.info("Starting embeddings creation")
            
            # Get all items and their storage locations
            items = db.query(StoredItem).all()
            storage_locations = {}
            
            # Build storage location lookup
            shelves = db.query(StorageLevel1).all()
            for shelf in shelves:
                for container in shelf.containers:
                    storage_locations[container.id] = {
                        'shelf_name': shelf.name,
                        'container_name': container.name
                    }
            
            # Process items in batches
            embeddings_data = []
            batch_size = 100
            for i in range(0, len(items), batch_size):
                batch = items[i:i + batch_size]
                batch_texts = []
                
                # Prepare texts for batch processing
                for item in batch:
                    storage = storage_locations.get(item.shelf_id) if item.shelf_id else None
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