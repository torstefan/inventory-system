# backend/api/routes/inventory/item_routes.py

from quart import Blueprint, request
import logging
from sqlalchemy.orm import Session
from database.db import SessionLocal
from api.models.item import StoredItem
from api.models.storage import StorageLevel1, StorageLevel2

inventory_bp = Blueprint('inventory', __name__)
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

@inventory_bp.route('/items/<int:item_id>', methods=['GET'])
async def get_item(item_id):
    try:
        with SessionLocal() as db:
            item = db.query(StoredItem).filter_by(id=item_id).first()
            if not item:
                return {'error': 'Item not found'}, 404
            return item.to_dict()
    except Exception as e:
        logger.error(f"Error getting item: {str(e)}")
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
