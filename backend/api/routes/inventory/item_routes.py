# backend/api/routes/inventory/item_routes.py

from flask import Blueprint, request, jsonify
from database.db import SessionLocal
from api.models.item import StoredItem
from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3
from sqlalchemy.orm import joinedload
from .location_handler import handle_location_assignment

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/items', methods=['GET'])
def get_items():
    db = SessionLocal()
    try:
        items = db.query(StoredItem).options(
            joinedload(StoredItem.location).joinedload(StorageLevel3.container).joinedload(StorageLevel2.shelf)
        ).all()
        
        items_data = []
        for item in items:
            items_data.append(format_item_data(item))
        
        return jsonify({'items': items_data})
        
    except Exception as e:
        print(f"Error in get_items: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@inventory_bp.route('/items', methods=['POST'])
def create_item():
    data = request.json
    print("Received data:", data)
    db = SessionLocal()
    
    try:
        new_item = create_item_object(data)
        
        # Handle location assignment
        if 'selected_location' in data:
            handle_location_assignment(db, new_item, data['selected_location'])
        
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        return jsonify({
            'message': 'Item created successfully',
            'id': new_item.id
        })
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()

@inventory_bp.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.json
    db = SessionLocal()
    try:
        item = db.query(StoredItem).filter_by(id=item_id).first()
        if not item:
            return jsonify({'error': 'Item not found'}), 404

        update_item_fields(item, data)
        
        # Handle location update
        if 'selected_location' in data:
            handle_location_assignment(db, item, data['selected_location'])

        db.commit()
        return jsonify({'message': 'Item updated successfully'})
        
    except Exception as e:
        db.rollback()
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

def format_item_data(item):
    """Format item data for API response"""
    location_info = {
        'shelf': None,
        'container': None
    }
    
    if item.location and item.location.container:
        container = item.location.container
        location_info['container'] = container.name
        if container.shelf:
            location_info['shelf'] = container.shelf.name
    
    return {
        'id': item.id,
        'category': item.category,
        'subcategory': item.subcategory,
        'brand': item.brand,
        'model': item.model,
        'condition': item.condition,
        'location': location_info,
        'image_path': item.image_path,
        'date_added': item.date_added.isoformat(),
        'last_modified': item.last_modified.isoformat()
    }

def create_item_object(data):
    """Create a new StoredItem object from request data"""
    return StoredItem(
        category=data.get('category'),
        subcategory=data.get('subcategory'),
        brand=data.get('brand'),
        model=data.get('model'),
        condition=data.get('condition'),
        image_path=data.get('image_path'),
        notes=data.get('notes')
    )

def update_item_fields(item, data):
    """Update the fields of an existing item"""
    fields = ['category', 'subcategory', 'brand', 'model', 'condition']
    for field in fields:
        if field in data:
            setattr(item, field, data[field])
