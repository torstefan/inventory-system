import os
from openai import OpenAI
import logging
import json
from database.db import SessionLocal
from api.models.storage import StorageLevel1

logger = logging.getLogger(__name__)

class TextProcessor:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.error("OPENAI_API_KEY not found in environment variables")
            raise ValueError("OPENAI_API_KEY not found in environment variables")
            
        self.client = OpenAI(api_key=api_key)
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4')

    def get_storage_structure(self):
        """Get current storage structure to help with location suggestions"""
        db = SessionLocal()
        try:
            shelves = db.query(StorageLevel1).all()
            storage_info = []
            for shelf in shelves:
                shelf_info = {
                    "shelf_name": shelf.name,
                    "shelf_description": shelf.description,
                    "containers": []
                }
                for container in shelf.containers:
                    shelf_info["containers"].append({
                        "name": container.name,
                        "type": container.container_type.value,
                        "description": container.description
                    })
                storage_info.append(shelf_info)
            return storage_info
        finally:
            db.close()

    def process_text(self, description):
        try:
            logger.info(f"Processing text description")
            
            # Get storage structure
            storage_info = self.get_storage_structure()
            storage_context = json.dumps(storage_info, indent=2)

            # Prepare the prompt
            prompt = f"""Analyze this item description and provide:
            1. Category and identification
            2. Key features from the description
            3. A detailed technical description of what this item is
            4. Common use cases and applications
            5. Suggest the best storage location based on this storage structure:
            {storage_context}

            Item description: {description}

            IMPORTANT: 
            - You must suggest at least 2 alternative locations from different shelves if available
            - Each location suggestion must include clear reasoning
            - Consider the item type and characteristics when suggesting locations
            - Provide comprehensive technical details and use cases

            Format the response as a clean JSON:
            {{
                "category": "",
                "subcategory": "",
                "properties": {{
                    "brand": "",
                    "model": "",
                    "condition": ""
                }},
                "technical_details": {{
                    "description": "A detailed technical description of what this item is",
                    "use_cases": [
                        "List of common applications and use cases",
                        "Each as a separate string in the array"
                    ]
                }},
                "suggested_location": {{
                    "shelf": "",
                    "container": "",
                    "reasoning": "Explain why this is the best location"
                }},
                "alternative_locations": [
                    {{
                        "shelf": "Different shelf name",
                        "container": "Different container name",
                        "reasoning": "Explain why this is a good alternative"
                    }}
                ]
            }}

            Make sure to use actual shelf and container names from the provided storage structure."""

            # Make the API request
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000
            )
            
            # Parse and return the response
            response_content = response.choices[0].message.content
            return json.loads(response_content)
                
        except Exception as e:
            logger.error(f"Error in process_text: {str(e)}", exc_info=True)
            raise
