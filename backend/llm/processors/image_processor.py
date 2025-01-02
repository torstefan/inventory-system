import os
import base64
from openai import OpenAI
from dotenv import load_dotenv
import logging
import httpx
import re
import json

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

    def encode_image(self, image_path):
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {str(e)}", exc_info=True)
            raise

    def clean_json_string(self, json_str: str) -> str:
        """Clean the JSON string by removing markdown code blocks and other formatting."""
        # Remove markdown code block markers
        json_str = re.sub(r'```json\s*', '', json_str)
        json_str = re.sub(r'```\s*$', '', json_str)
        # Remove any leading/trailing whitespace
        json_str = json_str.strip()
        return json_str

    def process_image(self, image_path):
        try:
            logger.info(f"Processing image: {image_path}")
            
            if not os.path.exists(image_path):
                logger.error(f"Image file not found: {image_path}")
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            # Encode image to base64
            base64_image = self.encode_image(image_path)
            logger.debug("Image encoded successfully")

            # Prepare the prompt for GPT-4 Vision
            prompt = """Analyze this electronic component image and provide:
            1. Category (e.g., microcontroller, sensor, display)
            2. Specific identification (brand, model)
            3. Key features visible in the image
            Format the response as a clean JSON without markdown blocks or other formatting:
            {
                "category": "",
                "subcategory": "",
                "properties": {
                    "brand": "",
                    "model": "",
                    "condition": ""
                },
                "suggested_location": {
                    "shelf": "",
                    "box": ""
                }
            }"""

            logger.debug("Making API request to OpenAI")
            response = self.client.chat.completions.create(
                model="gpt-4o",
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
                max_tokens=500
            )
            logger.info("Successfully received response from OpenAI")
            
            # Get the response content and clean it
            response_content = response.choices[0].message.content
            cleaned_json = self.clean_json_string(response_content)
            
            # Try to parse the cleaned JSON
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