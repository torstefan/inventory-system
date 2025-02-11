# backend/app.py

from quart import Quart, jsonify, send_from_directory
from quart_cors import cors
from api.routes import register_routes
from api.routes.storage_init import init_bp
import logging
import sys
from pathlib import Path
from database.db import Base, engine

# Update logging configuration
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('debug.log')
    ]
)

# Create a logger for the app
logger = logging.getLogger(__name__)

def create_app():
    # Create Quart app
    app = Quart(__name__)
    
    # Add logger to app
    app.logger = logger
    
    # Configure CORS
    app = cors(app, 
              allow_origin="http://localhost:3000", 
              allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
              allow_headers=["Content-Type", "Authorization"])
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Define absolute paths
    BACKEND_DIR = Path(__file__).resolve().parent
    STATIC_DIR = BACKEND_DIR / 'static'
    UPLOAD_DIR = STATIC_DIR / 'uploads'

    # Ensure upload directory exists
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Register routes - do this only once
    register_routes(app)
    app.register_blueprint(init_bp, url_prefix='/api')

    # Add debug logging
    app.logger.info("Registered routes:")
    for rule in app.url_map.iter_rules():
        app.logger.info(f"Route: {rule.rule}, Methods: {rule.methods}, Endpoint: {rule.endpoint}")

    # Enhanced error handler
    @app.errorhandler(Exception)
    async def handle_exception(e):
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return {"error": str(e), "type": type(e).__name__}, 500

    @app.route('/')
    async def home():
        return {"status": "ok", "message": "Inventory System API is running"}

    @app.route('/static/<path:filename>')
    async def serve_static(filename):
        app.logger.debug(f"Attempting to serve static file: {filename}")
        try:
            if filename.startswith('uploads/'):
                actual_filename = filename.replace('uploads/', '', 1)
                app.logger.debug(f"Serving from uploads dir: {actual_filename}")
                return await send_from_directory(str(UPLOAD_DIR), actual_filename)
            else:
                app.logger.debug(f"Serving from static dir: {filename}")
                return await send_from_directory(str(STATIC_DIR), filename)
        except Exception as e:
            app.logger.error(f"Error serving static file {filename}: {str(e)}")
            return {"error": f"File not found: {filename}"}, 404

    return app

# Create the app instance
app = create_app()

if __name__ == '__main__':
    app.logger.info("Starting Flask application...")
    app.run(debug=True)
