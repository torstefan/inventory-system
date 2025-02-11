from quart import Blueprint, request
import logging
from database.db import SessionLocal
from ..rag.embeddings import InventoryEmbeddingManager
from ..rag.query_handler import InventoryRAGHandler
from asgiref.sync import async_to_sync
from functools import wraps
from openai import OpenAIError
from sqlalchemy.exc import SQLAlchemyError

# Set up logging
logger = logging.getLogger(__name__)

# Initialize everything without loading embeddings
rag_bp = Blueprint('rag', __name__)
embeddings_data = None  # Start with no embeddings
embedding_manager = InventoryEmbeddingManager()
rag_handler = InventoryRAGHandler(embedding_manager)

def handle_errors(f):
    """Error handling decorator for RAG endpoints"""
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        try:
            return await f(*args, **kwargs)
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return {
                "error": "OpenAI API error",
                "message": str(e)
            }, 503
        except SQLAlchemyError as e:
            logger.error(f"Database error: {str(e)}")
            return {
                "error": "Database error",
                "message": "An error occurred while accessing the database"
            }, 500
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return {
                "error": "Internal server error",
                "message": "An unexpected error occurred"
            }, 500
    return decorated_function

@rag_bp.route('/status', methods=['GET'])
@handle_errors
async def get_status():
    """Get the current status of the RAG system"""
    return {
        "embeddings_initialized": embeddings_data is not None,
        "item_count": len(embeddings_data) if embeddings_data is not None else 0
    }

@rag_bp.route('/refresh-embeddings', methods=['POST'])
@handle_errors
async def refresh_embeddings():
    """Refresh all embeddings for the inventory"""
    global embeddings_data
    
    logger.info("Starting embeddings refresh")
    
    try:
        with SessionLocal() as db:
            embeddings_data = await embedding_manager.create_embeddings(db)
            logger.info(f"Successfully refreshed embeddings for {len(embeddings_data)} items")
            return {
                "message": "Embeddings refreshed successfully",
                "item_count": len(embeddings_data)
            }
    except Exception as e:
        embeddings_data = None  # Reset on failure
        raise

@rag_bp.route('/query', methods=['POST'])
@handle_errors
async def query_rag():
    if embeddings_data is None:
        return {
            "error": "Configuration error",
            "message": "Embeddings not initialized. Please refresh embeddings first."
        }, 400
    
    try:
        data = await request.get_json()
        query = data.get('query')
        if not query:
            return {'error': 'No query provided'}, 400

        result = await rag_handler.get_answer(query, embeddings_data)
        return result

    except Exception as e:
        logger.error(f"Error in query: {str(e)}")
        return {'error': str(e)}, 500

@rag_bp.route('/embeddings/status', methods=['GET'])
@handle_errors
async def get_embeddings_status():
    """Get the current status of embeddings"""
    return {
        "loaded": embeddings_data is not None,
        "count": len(embeddings_data) if embeddings_data else 0
    }

@rag_bp.route('/embeddings/reload', methods=['POST'])
@handle_errors
async def reload_embeddings():
    """Reload all embeddings"""
    try:
        with SessionLocal() as db:
            global embeddings_data
            embeddings_data = await embedding_manager.create_embeddings(db)
            return {
                "status": "success",
                "message": f"Successfully loaded {len(embeddings_data)} embeddings"
            }
    except Exception as e:
        logger.error(f"Error reloading embeddings: {str(e)}")
        return {'error': str(e)}, 500

@rag_bp.route('/test', methods=['GET'])
@handle_errors
async def test_route():
    return {
        "status": "ok",
        "message": "RAG routes are working"
    } 