import os
import logging
from openai import OpenAI
from dotenv import load_dotenv
import json
import re

logger = logging.getLogger(__name__)
load_dotenv()

class TextProcessor:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.error("OPENAI_API_KEY not found in environment variables")
            raise ValueError("OPENAI_API_KEY not found in environment variables")
            
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4"  # or whatever model you prefer

    def clean_json_string(self, json_str: str) -> str:
        """Extract and clean JSON from the response string."""
        # Try to find JSON block within markdown
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', json_str, re.DOTALL)
        if json_match:
            return json_match.group(1).strip()
        
        # If no markdown blocks, try to find just a JSON object
        json_match = re.search(r'(\{.*\})', json_str, re.DOTALL)
        if json_match:
            return json_match.group(1).strip()
        
        # If no JSON found, return the original string
        return json_str.strip()

    def process_text(self, description: str):
        """Process text description of an item."""
        try:
            logger.info("Processing text description")
            
            # Get storage structure (you might want to implement this)
            storage_info = []  # Implement getting storage structure
            
            prompt = f"""You are a JSON API. Respond only with a valid JSON object, no other text. Analyze this item description:
            1. Category and identification
            2. Key features from the description
            3. A detailed technical description of what this item is
            4. Common use cases and applications
            5. Suggest the best storage location based on this storage structure:
            {json.dumps(storage_info, indent=2)}

            Item description: {description}

            IMPORTANT: 
            - You must suggest at least 2 alternative locations from different shelves if available
            - Each location suggestion must include clear reasoning
            - Consider the item type and characteristics when suggesting locations
            - Provide comprehensive technical details and use cases

            Format the response as a clean JSON:
            {{
                "category": "semiconductor",
                "subcategory": "transistor",
                "properties": {{
                    "brand": "manufacturer name if known",
                    "model": "2N3906",
                    "condition": "new/used/etc"
                }},
                "technical_details": {{
                    "description": "A detailed technical description of what this item is",
                    "use_cases": [
                        "List of common applications and use cases",
                        "Each as a separate string in the array"
                    ]
                }},
                "suggested_location": {{
                    "shelf": "shelf name",
                    "container": "container name",
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

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000
            )
            
            # Get the response content
            response_content = response.choices[0].message.content
            
            # Clean the response
            cleaned_json = self.clean_json_string(response_content)
            
            # Log the cleaned response for debugging
            logger.debug(f"Cleaned response: {cleaned_json}")
            
            # Parse the JSON
            try:
                parsed_json = json.loads(cleaned_json)
                return parsed_json
            except json.JSONDecodeError as e:
                logger.error(f"JSON parsing error: {str(e)}")
                logger.error(f"Failed to parse JSON: {cleaned_json}")
                # Return a basic structured response instead of failing
                return {
                    "category": "semiconductor",
                    "subcategory": "transistor",
                    "properties": {
                        "model": description,
                        "brand": "Unknown",
                        "condition": "Unknown"
                    },
                    "technical_details": {
                        "description": "Error processing description",
                        "use_cases": ["Error retrieving use cases"]
                    }
                }
                
        except Exception as e:
            logger.error(f"Error in process_text: {str(e)}", exc_info=True)
            raise
