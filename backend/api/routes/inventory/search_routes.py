# backend/api/routes/inventory/search_routes.py

from flask import Blueprint, request, jsonify
from sqlalchemy import or_, cast, JSON
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from database.db import SessionLocal
from api.models.item import StoredItem

search_bp = Blueprint('search', __name__)

@search_bp.route('/search', methods=['GET'])
def search_items():
    query = request.args.get('query', '').strip().lower()
    
    if len(query) < 3:
        return jsonify({
            'items': [],
            'message': 'Query must be at least 3 characters long'
        }), 400

    db = SessionLocal()
    try:
        # Create a search filter across regular columns
        search_filter = or_(
            StoredItem.category.ilike(f'%{query}%'),
            StoredItem.subcategory.ilike(f'%{query}%'),
            StoredItem.brand.ilike(f'%{query}%'),
            StoredItem.model.ilike(f'%{query}%')
        )

        # Execute the search query
        items = db.query(StoredItem).filter(search_filter).all()
        
        # Additional filtering for JSON fields
        if len(items) == 0:
            # Try searching in technical details
            all_items = db.query(StoredItem).all()
            items = [
                item for item in all_items
                if item.technical_details and (
                    (isinstance(item.technical_details.get('description'), str) and
                     query in item.technical_details['description'].lower()) or
                    any(isinstance(use_case, str) and query in use_case.lower()
                        for use_case in item.technical_details.get('use_cases', []))
                )
            ]
        
        # Convert items to dictionary representation
        items_dict = [item.to_dict() for item in items]
        
        return jsonify({
            'items': items_dict,
            'count': len(items_dict)
        })

    except Exception as e:
        db.rollback()
        return jsonify({
            'error': str(e),
            'message': 'Error performing search'
        }), 500
    finally:
        db.close()
