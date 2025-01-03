from flask import Blueprint, request, jsonify, current_app
from llm.processors.text_processor import TextProcessor

text_processing_bp = Blueprint('text_processing', __name__)
processor = TextProcessor()

@text_processing_bp.route('/process', methods=['POST'])
def process_text():
    try:
        data = request.get_json()
        if not data or 'description' not in data:
            return jsonify({'error': 'No description provided'}), 400
            
        description = data['description']
        current_app.logger.info(f"Processing text description: {description}")
        
        # Process the text description
        classification = processor.process_text(description)
        
        return jsonify({
            'message': 'Text processed successfully',
            'classification': classification
        })
        
    except Exception as e:
        current_app.logger.error(f"Error processing text: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
