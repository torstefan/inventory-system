# backend/api/routes/inventory/item_routes.py

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.orm import Session
from database.db import SessionLocal
from api.models.item import StoredItem
from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3

inventory_bp = Blueprint('inventory', __name__)

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

@inventory_bp.route('/items', methods=['GET'])
def get_items():
    try:
        db = get_db()
        items = db.query(StoredItem).all()
        return jsonify({
            'items': [item.to_dict() for item in items]
        })
    except Exception as e:
        current_app.logger.error(f"Error fetching items: {str(e)}")
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/items', methods=['POST'])
def create_item():
    try:
        data = request.get_json()
        db = get_db()
        
        # Create new item
        new_item = StoredItem(
            category=data['category'],
            subcategory=data.get('subcategory'),
            brand=data.get('brand'),
            model=data.get('model'),
            condition=data.get('condition'),
            technical_description=data.get('technical_description'),
            use_cases=data.get('use_cases', []),
            image_path=data.get('image_path')
        )
        
        # Handle location if provided
        if data.get('selected_location'):
            loc = data['selected_location']
            shelf = db.query(StorageLevel1).filter_by(name=loc['shelf']).first()
            if shelf:
                container = db.query(StorageLevel2).filter_by(
                    shelf_id=shelf.id, 
                    name=loc['container']
                ).first()
                if container:
                    # Create or get default compartment
                    compartment = db.query(StorageLevel3).filter_by(
                        container_id=container.id,
                        name='default'
                    ).first()
                    if not compartment:
                        compartment = StorageLevel3(
                            container_id=container.id,
                            name='default'
                        )
                        db.add(compartment)
                    new_item.level3_id = compartment.id

        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        return jsonify(new_item.to_dict())
        
    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error creating item: {str(e)}")
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
            item.technical_description = data['technical_description']
        if 'use_cases' in data:
            item.use_cases = data['use_cases']
            
        # Update location if provided
        if data.get('selected_location'):
            loc = data['selected_location']
            shelf = db.query(StorageLevel1).filter_by(name=loc['shelf']).first()
            if shelf:
                container = db.query(StorageLevel2).filter_by(
                    shelf_id=shelf.id, 
                    name=loc['container']
                ).first()
                if container:
                    # Create or get default compartment
                    compartment = db.query(StorageLevel3).filter_by(
                        container_id=container.id,
                        name='default'
                    ).first()
                    if not compartment:
                        compartment = StorageLevel3(
                            container_id=container.id,
                            name='default'
                        )
                        db.add(compartment)
                    item.level3_id = compartment.id

        db.commit()
        db.refresh(item)
        return jsonify(item.to_dict())
        
    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error updating item: {str(e)}")
        return jsonify({'error': str(e)}), 400

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
        db.rollback()
        current_app.logger.error(f"Error deleting item: {str(e)}")
        return jsonify({'error': str(e)}), 400
