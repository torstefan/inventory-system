# backend/app.py

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from api.routes import register_routes
from api.routes.storage_init import init_bp
import logging
import sys
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('debug.log')
    ]
)

app = Flask(__name__)

# Define absolute paths
BACKEND_DIR = Path(__file__).resolve().parent
STATIC_DIR = BACKEND_DIR / 'static'
UPLOAD_DIR = STATIC_DIR / 'uploads'

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Enhanced CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Disposition"]  # Important for file downloads
    }
})

# Register routes before error handlers
register_routes(app)
app.register_blueprint(init_bp, url_prefix='/api')

# Enhanced error handler
@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
    return jsonify({
        'error': str(e),
        'type': type(e).__name__
    }), 500

# Add OPTIONS handler for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Expose-Headers', 'Content-Disposition')
    return response

@app.route('/')
def home():
    return jsonify({
        'status': 'ok',
        'message': 'Inventory System API is running'
    })

@app.route('/static/<path:filename>')
def serve_static(filename):
    app.logger.debug(f"Attempting to serve static file: {filename}")
    try:
        if filename.startswith('uploads/'):
            actual_filename = filename.replace('uploads/', '', 1)
            app.logger.debug(f"Serving from uploads dir: {actual_filename}")
            return send_from_directory(str(UPLOAD_DIR), actual_filename)
        else:
            app.logger.debug(f"Serving from static dir: {filename}")
            return send_from_directory(str(STATIC_DIR), filename)
    except Exception as e:
        app.logger.error(f"Error serving static file {filename}: {str(e)}")
        return jsonify({'error': f'File not found: {filename}'}), 404

if __name__ == '__main__':
    app.logger.info(f"Static directory path: {STATIC_DIR}")
    app.logger.info(f"Upload directory path: {UPLOAD_DIR}")
    app.run(debug=True)
