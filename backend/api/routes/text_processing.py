# backend/api/routes/text_processing.py
from quart import Blueprint, request
import logging
from llm.processors.text_processor import TextProcessor

text_processing_bp = Blueprint('text_processing', __name__)
logger = logging.getLogger(__name__)

processor = TextProcessor()

@text_processing_bp.route('/analyze', methods=['POST'])
async def analyze_item():
    try:
        data = await request.get_json()
        if not data or 'text' not in data:
            return {'error': 'No text provided'}, 400

        result = await processor.process_text(data['text'])
        return result

    except Exception as e:
        logger.error(f"Error analyzing text: {str(e)}")
        return {'error': str(e)}, 500
