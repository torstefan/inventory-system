# backend/api/routes/__init__.py

from flask import Blueprint
from .image_routes import image_bp
from .inventory.item_routes import inventory_bp
from .inventory.search_routes import search_bp
from .storage_routes import storage_bp
from .text_processing import text_processing_bp
from .camera_routes import camera_bp
from .data_management import data_management_bp

api = Blueprint('api', __name__)

def register_routes(app):
    """Register all route blueprints with the Flask app"""
    app.register_blueprint(image_bp, url_prefix='/api/images')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
    app.register_blueprint(search_bp, url_prefix='/api/inventory')
    app.register_blueprint(storage_bp, url_prefix='/api/storage')
    app.register_blueprint(text_processing_bp, url_prefix='/api/text')
    app.register_blueprint(camera_bp, url_prefix='/api/camera')
    app.register_blueprint(data_management_bp, url_prefix='/api/data')
