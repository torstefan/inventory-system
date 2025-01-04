# backend/api/routes/inventory/item_routes.py

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.orm import Session
from database.db import SessionLocal
from api.models.item import StoredItem
from api.models.storage import StorageLevel1, StorageLevel2
import logging


inventory_bp = Blueprint('inventory', __name__)
logger = logging.getLogger(__name__)

@inventory_bp.route('/items', methods=['POST'])
def create_item():
    data = request.get_json()
    logger.debug(f"Received item data: {data}")
    
    db = SessionLocal()
    try:
        # Create new item
        new_item = StoredItem(
            category=data['category'],
            subcategory=data.get('subcategory'),
            brand=data.get('brand'),
            model=data.get('model'),
            condition=data.get('condition'),
            technical_details=data.get('technical_details'),
            image_path=data.get('image_path')  # Make sure this is being set
        )

        # Process location if provided
        if data.get('selected_location'):
            logger.debug(f"Processing location data: {data['selected_location']}")
            location_data = data['selected_location']
            
            # Find shelf by name
            shelf = db.query(StorageLevel1).filter_by(
                name=location_data['shelf']
            ).first()
            
            if shelf:
                logger.debug(f"Found shelf: {shelf.id} - {shelf.name}")
                new_item.shelf_id = shelf.id
                
                # Find container by name within this shelf
                container = db.query(StorageLevel2).filter_by(
                    shelf_id=shelf.id,
                    name=location_data['container']
                ).first()
                
                if container:
                    logger.debug(f"Found container: {container.id} - {container.name}")
                    new_item.container_id = container.id
        
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        # Convert to dictionary response
        return jsonify(new_item.to_dict())
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating item: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()

@inventory_bp.route('/items', methods=['GET'])
def get_items():
    db = SessionLocal()
    try:
        items = db.query(StoredItem).all()
        return jsonify({
            'items': [item.to_dict() for item in items]
        })
    except Exception as e:
        logger.error(f"Error fetching items: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@inventory_bp.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    db = SessionLocal()
    try:
        item = db.query(StoredItem).filter_by(id=item_id).first()
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        return jsonify(item.to_dict())
    finally:
        db.close()




@inventory_bp.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    try:
        data = request.get_json()
        current_app.logger.debug(f"Received update data: {data}")  # Debug log

        db = SessionLocal()

        item = db.query(StoredItem).filter(StoredItem.id == item_id).first()
        if not item:
            return jsonify({'error': 'Item not found'}), 404

        # Just update the image path if that's all we got
        if 'image_path' in data and len(data) == 1:
            current_app.logger.debug(f"Updating only image path to: {data['image_path']}")
            item.image_path = data['image_path']
            db.commit()
            return jsonify(item.to_dict())

        # Otherwise handle full update
        if 'category' in data:
            item.category = data['category']
        if 'subcategory' in data:
            item.subcategory = data['subcategory']
        if 'brand' in data:
            item.brand = data['brand']
        if 'model' in data:
            item.model = data['model']
        if 'condition' in data:
            item.condition = data['condition']
        if 'technical_description' in data:
            item.technical_details = {
                'description': data['technical_description']
            }
        if 'use_cases' in data:
            if isinstance(item.technical_details, dict):
                item.technical_details['use_cases'] = data['use_cases']
            else:
                item.technical_details = {'use_cases': data['use_cases']}
        if 'selected_location' in data and data['selected_location']:
            item.shelf_id = data['selected_location'].get('shelf_id')
            item.container_id = data['selected_location'].get('container_id')

        db.commit()

        # Log the updated item details
        current_app.logger.debug(f"Updated item {item_id}. Image path: {item.image_path}")

        return jsonify(item.to_dict())

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error updating item: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()

@inventory_bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    db = SessionLocal()
    try:
        item = db.query(StoredItem).filter_by(id=item_id).first()
        if not item:
            return jsonify({'error': 'Item not found'}), 404
            
        db.delete(item)
        db.commit()
        return jsonify({'message': 'Item deleted successfully'})
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()
