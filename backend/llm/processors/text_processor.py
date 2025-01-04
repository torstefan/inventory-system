import os
from openai import OpenAI
from dotenv import load_dotenv
import logging
import httpx
import json
from database.db import SessionLocal
from api.models.storage import StorageLevel1

logger = logging.getLogger(__name__)

load_dotenv()

class TextProcessor:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.error("OPENAI_API_KEY not found in environment variables")
            raise ValueError("OPENAI_API_KEY not found in environment variables")
            
        http_client = httpx.Client(
            base_url="https://api.openai.com/v1",
            headers={"Authorization": f"Bearer {api_key}"}
        )
        
        self.client = OpenAI(
            api_key=api_key,
            http_client=http_client
        )
        
        self.text_model = os.getenv('OPENAI_TEXT_MODEL', 'gpt-4')

    def get_storage_structure(self):
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

    def clean_json_string(self, json_str: str) -> str:
        # Remove markdown code blocks
        json_str = json_str.replace('```json', '').replace('```', '')
        # Remove any leading/trailing whitespace
        return json_str.strip()

    def process_text(self, description: str):
        try:
            logger.info(f"Processing text description: {description}")
            
            storage_info = self.get_storage_structure()
            storage_context = json.dumps(storage_info, indent=2)

            system_prompt = """You are a helpful assistant that analyzes electronic component descriptions and returns structured data about them. 
Always respond with valid JSON data following the exact structure provided."""

            prompt = f"""Analyze this electronic component description and provide information in JSON format:
            Description: {description}
            
            Available Storage Locations:
            {storage_context}

            IMPORTANT: 
            - Return only valid JSON data
            - Provide comprehensive technical details
            - List multiple common use cases
            - Suggest at least 2 alternative locations from different shelves
            - Include clear reasoning for location suggestions
            - Match location names exactly as provided in the storage structure

            Return your response in this exact JSON structure:
            {{
                "category": "component category",
                "subcategory": "specific type",
                "properties": {{
                    "brand": "manufacturer if mentioned",
                    "model": "model number if mentioned",
                    "condition": "condition if mentioned"
                }},
                "technical_details": {{
                    "description": "comprehensive technical description",
                    "use_cases": [
                        "use case 1",
                        "use case 2"
                    ]
                }},
                "suggested_location": {{
                    "shelf": "exact shelf name from structure",
                    "container": "exact container name",
                    "reasoning": "detailed explanation"
                }},
                "alternative_locations": [
                    {{
                        "shelf": "different shelf name",
                        "container": "container name",
                        "reasoning": "explanation"
                    }}
                ]
            }}"""

            response = self.client.chat.completions.create(
                model=self.text_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000
            )
            
            response_content = response.choices[0].message.content
            logger.debug(f"Raw response content: {response_content}")
            
            cleaned_json = self.clean_json_string(response_content)
            logger.debug(f"Cleaned JSON: {cleaned_json}")
            
            return json.loads(cleaned_json)
            
        except Exception as e:
            logger.error(f"Error in process_text: {str(e)}", exc_info=True)
            raise