# backend/api/routes/text_processing.py
from flask import Blueprint, request, jsonify, current_app
from llm.processors.text_processor import TextProcessor

text_processing_bp = Blueprint('text_processing', __name__)
processor = TextProcessor()

@text_processing_bp.route('/analyze', methods=['POST'])
def analyze_item():
    try:
        data = request.get_json()
        current_app.logger.debug(f"Analyzing data: {data}")

        # Construct description from available fields
        item_description = []
        if data.get('category'):
            item_description.append(f"Category: {data['category']}")
        if data.get('subcategory'):
            item_description.append(f"Subcategory: {data['subcategory']}")
        if data.get('brand'):
            item_description.append(f"Brand: {data['brand']}")
        if data.get('model'):
            item_description.append(f"Model: {data['model']}")
        if data.get('manual_description'):
            item_description.append(f"Additional Details: {data['manual_description']}")

        description = " | ".join(item_description)
        
        # Process the description
        analysis = processor.process_text(description)
        
        current_app.logger.debug(f"Analysis result: {analysis}")
        
        return jsonify({
            'message': 'Analysis completed successfully',
            'analysis': analysis
        })
        
    except Exception as e:
        current_app.logger.error(f"Error analyzing item: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
