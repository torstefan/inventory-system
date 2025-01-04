# backend/api/routes/__init__.py

from flask import Blueprint
from .image_routes import image_bp
from .inventory.item_routes import inventory_bp
from .inventory.search_routes import search_bp  # Add this line
from .storage_routes import storage_bp
from .text_processing import text_processing_bp
from .camera_routes import camera_bp

api = Blueprint('api', __name__)

def register_routes(app):
    app.register_blueprint(image_bp, url_prefix='/api/images')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
    app.register_blueprint(search_bp, url_prefix='/api/inventory')  # Add this line
    app.register_blueprint(storage_bp, url_prefix='/api/storage')
    app.register_blueprint(text_processing_bp, url_prefix='/api/text')
    app.register_blueprint(camera_bp, url_prefix='/api/camera')
