from typing import List, Dict, Any
import numpy as np
from openai import AsyncOpenAI
import json
import logging

logger = logging.getLogger(__name__)

class InventoryRAGHandler:
    def __init__(self, embedding_manager):
        self.embedding_manager = embedding_manager
        self.async_client = AsyncOpenAI()

    async def find_relevant_items(
        self, 
        query: str, 
        embeddings_data: List[Dict[str, Any]], 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Find most relevant items for a given query"""
        try:
            # Get query embedding
            query_embedding_resp = await self.async_client.embeddings.create(
                input=query,
                model=self.embedding_manager.embedding_model
            )
            query_embedding = query_embedding_resp.data[0].embedding

            # Calculate similarities
            similarities = []
            for item_data in embeddings_data:
                similarity = np.dot(query_embedding, item_data["embedding"])
                similarities.append((similarity, item_data))

            # Get top-k most similar items
            similarities.sort(key=lambda x: x[0], reverse=True)
            return [item_data for _, item_data in similarities[:top_k]]

        except Exception as e:
            logger.error(f"Error finding relevant items: {str(e)}")
            raise

    async def query_inventory(self, query: str, relevant_items: List[Dict[str, Any]]) -> Dict:
        """Query the inventory using RAG"""
        try:
            # Create context from relevant items
            context = "\n\n".join([item["text"] for item in relevant_items])
            logger.debug(f"Created context of length {len(context)}")

            system_prompt = """You are an inventory assistant. Answer questions about the inventory using the provided context.
            Format your response as a JSON object with the following structure:
            {
                "answer": "Your natural language answer here",
                "items": [
                    {
                        "item_id": "The database ID of the item",
                        "relevance": "Why this item is relevant to the query",
                        "details": {
                            "category": "Item category",
                            "location": "Storage location (include shelf and container)",
                            "technical_info": "Key technical details as a string"
                        }
                    }
                ]
            }
            Always include the exact database ID from the context in the item_id field.
            Include only the most relevant items. Make sure the response is valid JSON."""

            # Use async client for chat completion
            response = await self.async_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Context about the inventory:\n\n{context}\n\nQuestion: {query}"}
                ],
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            
            # Add database IDs to the response
            for item in result.get('items', []):
                # Find the corresponding item in relevant_items
                for rel_item in relevant_items:
                    # Match based on text content
                    item_tech_info = str(item.get('details', {}).get('technical_info', '')).lower()
                    rel_item_text = str(rel_item.get('text', '')).lower()
                    
                    if item_tech_info in rel_item_text or rel_item_text in item_tech_info:
                        item['item_id'] = rel_item['item_id']
                        logger.debug(f"Matched item with database ID: {item['item_id']}")
                        break
                
                # If no ID was found, log a warning
                if not item.get('item_id'):
                    logger.warning(f"Could not find matching ID for item: {item}")

            logger.debug(f"Got formatted answer: {result}")
            return result

        except Exception as e:
            logger.error(f"Error querying inventory: {str(e)}")
            raise

    async def get_answer(self, query: str, embeddings_data: List[Dict[str, Any]]) -> Dict:
        """Get a complete answer for a query"""
        try:
            # Find relevant items
            relevant_items = await self.find_relevant_items(query, embeddings_data)
            logger.debug(f"Found {len(relevant_items)} relevant items")

            # Get formatted response
            result = await self.query_inventory(query, relevant_items)
            return result

        except Exception as e:
            logger.error(f"Error getting answer: {str(e)}")
            raise 