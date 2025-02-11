# backend/api/routes/inventory/item_routes.py

from quart import Blueprint, request
import logging
from sqlalchemy.orm import Session
from database.db import SessionLocal
from api.models.item import StoredItem
from api.models.storage import StorageLevel1, StorageLevel2

inventory_bp = Blueprint('inventory_items', __name__)
logger = logging.getLogger(__name__)

@inventory_bp.route('/items', methods=['POST'])
async def create_item():
    try:
        data = await request.get_json()
        logger.debug(f"Received item data: {data}")
        
        with SessionLocal() as db:
            new_item = StoredItem(
                category=data['category'],
                subcategory=data.get('subcategory'),
                brand=data.get('brand'),
                model=data.get('model'),
                condition=data.get('condition'),
                technical_details=data.get('technical_details'),
                image_path=data.get('image_path')
            )

            # Process location if provided
            if data.get('selected_location'):
                location_data = data['selected_location']
                shelf = db.query(StorageLevel1).filter_by(name=location_data['shelf']).first()
                if shelf:
                    new_item.shelf_id = shelf.id
                    container = db.query(StorageLevel2).filter_by(
                        shelf_id=shelf.id,
                        name=location_data['container']
                    ).first()
                    if container:
                        new_item.container_id = container.id

            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            return new_item.to_dict()

    except Exception as e:
        logger.error(f"Error creating item: {str(e)}")
        return {'error': str(e)}, 500

@inventory_bp.route('/items', methods=['GET'])
async def get_items():
    try:
        with SessionLocal() as db:
            items = db.query(StoredItem).all()
            return {'items': [item.to_dict() for item in items]}
    except Exception as e:
        logger.error(f"Error getting items: {str(e)}")
        return {'error': str(e)}, 500

@inventory_bp.route('/items/<int:item_id>', methods=['PUT'])
async def update_item(item_id):
    try:
        data = await request.get_json()
        logger.debug(f"Updating item {item_id} with data: {data}")

        with SessionLocal() as db:
            item = db.query(StoredItem).filter_by(id=item_id).first()
            if not item:
                return {'error': 'Item not found'}, 404

            # Update standard fields
            for field in ['category', 'subcategory', 'brand', 'model', 'condition', 
                         'image_path', 'technical_details', 'shelf_id', 'container_id']:
                if field in data:
                    setattr(item, field, data[field])

            db.commit()
            return item.to_dict()

    except Exception as e:
        logger.error(f"Error updating item: {str(e)}")
        return {'error': str(e)}, 400

@inventory_bp.route('/items/<int:item_id>', methods=['DELETE'])
async def delete_item(item_id):
    try:
        with SessionLocal() as db:
            item = db.query(StoredItem).filter_by(id=item_id).first()
            if not item:
                return {'error': 'Item not found'}, 404
                
            db.delete(item)
            db.commit()
            return {'message': 'Item deleted successfully'}
    except Exception as e:
        logger.error(f"Error deleting item: {str(e)}")
        return {'error': str(e)}, 400

@inventory_bp.route('/items/<item_id>', methods=['GET'])
async def get_item_details(item_id: str):
    """Get details for a specific item"""
    try:
        with SessionLocal() as db:
            # Try to find the item by ID first
            try:
                numeric_id = int(item_id)
                item = db.query(StoredItem).filter_by(id=numeric_id).first()
            except ValueError:
                # If not a numeric ID, try to find by model number or other identifiers
                item = db.query(StoredItem).filter(
                    (StoredItem.model == item_id) |
                    (StoredItem.brand + '-' + StoredItem.model == item_id)
                ).first()
            
            if not item:
                return {'error': 'Item not found'}, 404

            # Get the storage location details
            storage_info = None
            if item.shelf_id:
                shelf = db.query(StorageLevel1).filter_by(id=item.shelf_id).first()
                container = None
                if item.container_id:
                    container = db.query(StorageLevel2).filter_by(id=item.container_id).first()
                
                storage_info = {
                    'shelf': shelf.to_dict() if shelf else None,
                    'container': container.to_dict() if container else None
                }

            # Return detailed item information
            return {
                'id': item.id,
                'category': item.category,
                'subcategory': item.subcategory,
                'brand': item.brand,
                'model': item.model,
                'condition': item.condition,
                'technical_details': item.technical_details,
                'image_path': item.image_path,
                'storage': storage_info,
                'date_added': item.date_added.isoformat() if item.date_added else None,
                'last_modified': item.last_modified.isoformat() if item.last_modified else None
            }

    except Exception as e:
        logger.error(f"Error getting item details: {str(e)}")
        return {'error': str(e)}, 500

@inventory_bp.route('/list', methods=['GET'])  # Changed to a specific endpoint
async def list_items():
    """Get a list of all items with optional filtering"""
    try:
        with SessionLocal() as db:
            # Start with base query
            query = db.query(StoredItem)
            
            # Apply filters from query parameters
            if request.args.get('category'):
                query = query.filter(StoredItem.category == request.args.get('category'))
            if request.args.get('subcategory'):
                query = query.filter(StoredItem.subcategory == request.args.get('subcategory'))
            if request.args.get('brand'):
                query = query.filter(StoredItem.brand == request.args.get('brand'))
            
            # Execute query
            items = query.all()
            
            return {
                'total': len(items),
                'items': [{
                    'id': item.id,
                    'category': item.category,
                    'subcategory': item.subcategory,
                    'brand': item.brand,
                    'model': item.model,
                    'storage': {
                        'shelf': item.shelf.name if item.shelf else None,
                        'container': item.container.name if item.container else None
                    }
                } for item in items]
            }
    except Exception as e:
        logger.error(f"Error listing items: {str(e)}")
        return {'error': str(e)}, 500
