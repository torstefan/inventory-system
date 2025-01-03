# backend/api/routes/__init__.py

from flask import Blueprint
from .image_routes import image_bp
from .inventory.item_routes import inventory_bp  # Updated import
from .storage_routes import storage_bp
from .text_processing import text_processing_bp  # Add this line

api = Blueprint('api', __name__)

def register_routes(app):
    app.register_blueprint(image_bp, url_prefix='/api/images')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
    app.register_blueprint(storage_bp, url_prefix='/api/storage')
    app.register_blueprint(text_processing_bp, url_prefix='/api/text')  # Add this line
