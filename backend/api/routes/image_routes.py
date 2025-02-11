# backend/api/routes/image_routes.py

from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
import os
import sys
import json
from pathlib import Path
import uuid
from llm.processors.image_processor import ImageProcessor
import logging

# Add the backend directory to the Python path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(backend_dir))

image_bp = Blueprint('image', __name__)
logger = logging.getLogger(__name__)

# Define absolute paths
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
STATIC_DIR = BACKEND_DIR / 'static'
UPLOAD_DIR = STATIC_DIR / 'uploads'

# Create directories if they don't exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Initialize image processor
processor = ImageProcessor()

def generate_unique_filename(original_filename):
    """Generate a unique filename while preserving the original extension."""
    ext = os.path.splitext(original_filename)[1]
    return f"{uuid.uuid4()}{ext}"

@image_bp.route('/upload', methods=['POST'])
async def upload_image():
    """Upload and process image with LLM analysis"""
    try:
        files = await request.files
        if 'image' not in files:
            return {'error': 'No image file provided'}, 400

        file = files['image']
        if file.filename == '':
            return {'error': 'No selected file'}, 400
        
        # Generate a unique filename
        filename = generate_unique_filename(secure_filename(file.filename))
        filepath = UPLOAD_DIR / filename
        
        current_app.logger.debug(f"Saving file to: {filepath}")
        file.save(filepath)
        
        # Verify file was saved
        if not filepath.exists():
            raise Exception(f"Failed to save file at {filepath}")
        
        # Process the image with the LLM
        current_app.logger.info("Processing image with LLM")
        classification = processor.process_image(str(filepath))
        
        # Add the image path to the classification
        classification['image_path'] = f'uploads/{filename}'
        
        current_app.logger.info(f"Image processed successfully. Path: uploads/{filename}")
        return jsonify({
            'message': 'Image uploaded and processed successfully',
            'classification': classification
        })
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@image_bp.route('/raw-upload', methods=['POST'])
def upload_raw_image():
    """Upload image without LLM processing"""
    try:
        current_app.logger.info("Processing raw image upload request")
        
        if 'image' not in request.files:
            current_app.logger.warning("No image file in request")
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            current_app.logger.warning("Empty filename received")
            return jsonify({'error': 'No selected file'}), 400
        
        # Generate a unique filename
        filename = generate_unique_filename(secure_filename(file.filename))
        filepath = UPLOAD_DIR / filename
        
        current_app.logger.debug(f"Saving file to: {filepath}")
        file.save(filepath)
        
        # Verify file was saved
        if not filepath.exists():
            raise Exception(f"Failed to save file at {filepath}")
        
        # Return the path relative to the uploads directory
        image_path = f'uploads/{filename}'
        
        current_app.logger.info(f"Image uploaded successfully. Path: {image_path}")
        return jsonify({
            'message': 'Image uploaded successfully',
            'filepath': image_path
        })
        
    except Exception as e:
        current_app.logger.error(f"Error uploading image: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@image_bp.route('/static/uploads/<path:filename>')
async def serve_image(filename):
    try:
        return await send_file(
            Path(current_app.config['UPLOAD_FOLDER']) / filename,
            mimetype='image/jpeg'
        )
    except Exception as e:
        logger.error(f"Error serving image: {str(e)}")
        return {'error': 'Image not found'}, 404