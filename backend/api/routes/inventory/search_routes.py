# backend/api/routes/inventory/search_routes.py

from quart import Blueprint, request
import logging
from sqlalchemy import or_
from database.db import SessionLocal
from api.models.item import StoredItem

search_bp = Blueprint('search', __name__)
logger = logging.getLogger(__name__)

@search_bp.route('/search', methods=['GET'])
async def search_items():
    try:
        query = request.args.get('q', '')
        if not query:
            return {'error': 'No search query provided'}, 400

        with SessionLocal() as db:
            items = db.query(StoredItem).filter(
                or_(
                    StoredItem.category.ilike(f'%{query}%'),
                    StoredItem.subcategory.ilike(f'%{query}%'),
                    StoredItem.brand.ilike(f'%{query}%'),
                    StoredItem.model.ilike(f'%{query}%')
                )
            ).all()
            
            return {'items': [item.to_dict() for item in items]}
            
    except Exception as e:
        logger.error(f"Error searching items: {str(e)}")
        return {'error': str(e)}, 500
