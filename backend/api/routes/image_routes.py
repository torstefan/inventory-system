from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import sys
import json
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(backend_dir))

from llm.processors.image_processor import ImageProcessor

image_bp = Blueprint('image', __name__)
processor = ImageProcessor()

UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@image_bp.route('/upload', methods=['POST'])
def upload_image():
    try:
        current_app.logger.info("Processing image upload request")
        
        if 'image' not in request.files:
            current_app.logger.warning("No image file in request")
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            current_app.logger.warning("Empty filename received")
            return jsonify({'error': 'No selected file'}), 400
        
        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        current_app.logger.debug(f"Saving file to: {filepath}")
        file.save(filepath)
        
        # Process the image with GPT-4 Vision
        current_app.logger.info("Processing image with GPT-4 Vision")
        classification = processor.process_image(filepath)
        
        # The classification is already a dict, no need to parse it
        current_app.logger.info("Image processed successfully")
        return jsonify({
            'message': 'Image processed successfully',
            'filepath': filepath,
            'classification': classification
        })
        
    except Exception as e:
        current_app.logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500