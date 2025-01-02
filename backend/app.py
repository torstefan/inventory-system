# backend/app.py

from flask import Flask, jsonify
from flask_cors import CORS
from api.routes import register_routes
import logging
import sys

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

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Enhanced error handler
@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
    return jsonify({
        'error': str(e),
        'type': type(e).__name__
    }), 500

# Add a root route for basic health check
@app.route('/')
def home():
    return jsonify({
        'status': 'ok',
        'message': 'Inventory System API is running'
    })

# Register other routes
register_routes(app)

if __name__ == '__main__':
    app.run(debug=True)
