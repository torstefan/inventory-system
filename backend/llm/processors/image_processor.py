import os
import base64
from openai import OpenAI
from dotenv import load_dotenv
import logging
import httpx
import re
import json
from database.db import SessionLocal
from api.models.storage import StorageLevel1

logger = logging.getLogger(__name__)

load_dotenv()

class ImageProcessor:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.error("OPENAI_API_KEY not found in environment variables")
            raise ValueError("OPENAI_API_KEY not found in environment variables")
            
        # Create a custom httpx client without proxies
        http_client = httpx.Client(
            base_url="https://api.openai.com/v1",
            headers={"Authorization": f"Bearer {api_key}"}
        )
        
        self.client = OpenAI(
            api_key=api_key,
            http_client=http_client
        )
        
        # Set the vision model from environment variable or use default
        self.vision_model = os.getenv('OPENAI_VISION_MODEL', 'gpt-4o')

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

    def process_image(self, image_path):
        try:
            logger.info(f"Processing image: {image_path}")
            
            if not os.path.exists(image_path):
                logger.error(f"Image file not found: {image_path}")
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            # Get storage structure
            storage_info = self.get_storage_structure()
            
            # Encode image to base64
            base64_image = self.encode_image(image_path)
            logger.debug("Image encoded successfully")

            # Prepare the prompt for GPT-4 Vision
            storage_context = json.dumps(storage_info, indent=2)
            prompt = f"""Analyze this electronic component image and provide:
            1. Category and identification
            2. Key features visible in the image
            3. Suggest the best storage location based on this storage structure:
            {storage_context}

            IMPORTANT: 
            - You must suggest at least 2 alternative locations from different shelves if available
            - Each location suggestion must include clear reasoning
            - Consider the component type and characteristics when suggesting locations

            Format the response as a clean JSON:
            {{
                "category": "",
                "subcategory": "",
                "properties": {{
                    "brand": "",
                    "model": "",
                    "condition": ""
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

            logger.debug("Making API request to OpenAI")
            response = self.client.chat.completions.create(
                model=self.vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=800
            )
            
            # Get the response content and clean it
            response_content = response.choices[0].message.content
            cleaned_json = self.clean_json_string(response_content)
            
            try:
                parsed_json = json.loads(cleaned_json)
                return parsed_json
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse cleaned JSON: {str(e)}")
                logger.debug(f"Raw response: {response_content}")
                logger.debug(f"Cleaned JSON: {cleaned_json}")
                raise
                
        except Exception as e:
            logger.error(f"Error in process_image: {str(e)}", exc_info=True)
            raise

    def encode_image(self, image_path):
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {str(e)}", exc_info=True)
            raise

    def clean_json_string(self, json_str: str) -> str:
        """Clean the JSON string by removing markdown code blocks and other formatting."""
        json_str = re.sub(r'```json\s*', '', json_str)
        json_str = re.sub(r'```\s*$', '', json_str)
        return json_str.strip()
