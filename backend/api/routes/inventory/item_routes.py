# backend/api/routes/inventory/item_routes.py
from flask import Blueprint, request, jsonify, current_app
from database.db import SessionLocal
from api.models.item import StoredItem
from api.models.storage import StorageLevel1, StorageLevel2
from sqlalchemy.orm import Session
from datetime import datetime

inventory_bp = Blueprint('inventory', __name__)

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

@inventory_bp.route('/items', methods=['POST'])
def create_item():
    try:
        data = request.get_json()
        db = get_db()

        # Extract location data
        location_data = data.get('selected_location', {})
        shelf_name = location_data.get('shelf')
        container_name = location_data.get('container')

        # Find shelf and container if specified
        shelf = None
        container = None
        if shelf_name and container_name:
            shelf = db.query(StorageLevel1).filter_by(name=shelf_name).first()
            if shelf:
                container = db.query(StorageLevel2).filter_by(
                    shelf_id=shelf.id, 
                    name=container_name
                ).first()

        # Create new item
        new_item = StoredItem(
            category=data['category'],
            subcategory=data.get('subcategory'),
            brand=data.get('brand'),
            model=data.get('model'),
            condition=data.get('condition'),
            technical_details={
                'description': data.get('technical_details', {}).get('description'),
                'use_cases': data.get('technical_details', {}).get('use_cases', [])
            },
            shelf_id=shelf.id if shelf else None,
            container_id=container.id if container else None,
        )

        db.add(new_item)
        db.commit()
        db.refresh(new_item)

        return jsonify(new_item.to_dict())

    except Exception as e:
        current_app.logger.error(f"Error creating item: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400

@inventory_bp.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    try:
        data = request.get_json()
        db = get_db()
        
        item = db.query(StoredItem).filter_by(id=item_id).first()
        if not item:
            return jsonify({'error': 'Item not found'}), 404

        # Update basic fields
        for field in ['category', 'subcategory', 'brand', 'model', 'condition']:
            if field in data:
                setattr(item, field, data[field])

        # Update technical details
        if 'technical_details' in data:
            item.technical_details = {
                'description': data['technical_details'].get('description'),
                'use_cases': data['technical_details'].get('use_cases', [])
            }

        # Update location
        if 'selected_location' in data:
            location = data['selected_location']
            if location and location.get('shelf') and location.get('container'):
                shelf = db.query(StorageLevel1).filter_by(name=location['shelf']).first()
                if shelf:
                    container = db.query(StorageLevel2).filter_by(
                        shelf_id=shelf.id,
                        name=location['container']
                    ).first()
                    if container:
                        item.shelf_id = shelf.id
                        item.container_id = container.id
            else:
                item.shelf_id = None
                item.container_id = None

        item.last_modified = datetime.utcnow()
        db.commit()
        db.refresh(item)

        return jsonify(item.to_dict())

    except Exception as e:
        current_app.logger.error(f"Error updating item: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400

@inventory_bp.route('/items', methods=['GET'])
def get_items():
    try:
        db = get_db()
        items = db.query(StoredItem).all()
        return jsonify({
            'items': [item.to_dict() for item in items]
        })
    except Exception as e:
        current_app.logger.error(f"Error fetching items: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        db = get_db()
        item = db.query(StoredItem).filter_by(id=item_id).first()
        if not item:
            return jsonify({'error': 'Item not found'}), 404

        db.delete(item)
        db.commit()
        return jsonify({'message': 'Item deleted successfully'})
    except Exception as e:
        current_app.logger.error(f"Error deleting item: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400