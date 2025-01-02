from flask import Blueprint

api = Blueprint('api', __name__)

def register_routes(app):
    from .image_routes import image_bp
    from .inventory_routes import inventory_bp
    
    app.register_blueprint(image_bp, url_prefix='/api/images')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
