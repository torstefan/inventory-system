from flask import Blueprint, request, jsonify, current_app
from database.db import SessionLocal
from api.models.item import StoredItem
from api.models.storage import StorageLevel1, StorageLevel2
from sqlalchemy.orm import joinedload

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

@inventory_bp.route('/items', methods=['GET'])
def get_items():
    db = SessionLocal()
    try:
        items = db.query(StoredItem).options(
            joinedload(StoredItem.shelf),
            joinedload(StoredItem.container)
        ).all()
        
        return jsonify({
            'items': [item.to_dict() for item in items]
        })
    except Exception as e:
        current_app.logger.error(f"Error fetching items: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@inventory_bp.route('/items', methods=['POST'])
def create_item():
    db = SessionLocal()
    try:
        data = request.json
        current_app.logger.debug(f"Received item data: {data}")
        
        # Create new item
        new_item = StoredItem(
            category=data['category'],
            subcategory=data.get('subcategory'),
            brand=data.get('brand'),
            model=data.get('model'),
            condition=data.get('condition'),
            technical_details=data.get('technical_details')
        )
        
        # Handle location if provided
        if data.get('selected_location'):
            loc_data = data['selected_location']
            current_app.logger.debug(f"Processing location data: {loc_data}")
            current_app.logger.debug("Available shelves:")
            shelves = db.query(StorageLevel1).all()
            for shelf in shelves:
                current_app.logger.debug(f"- {shelf.id}: {shelf.name}")
            
            # Look up shelf by name
            shelf = db.query(StorageLevel1).filter(
                StorageLevel1.name == loc_data['shelf']
            ).first()
            
            if shelf:
                current_app.logger.debug(f"Found shelf: {shelf.id} - {shelf.name}")
                new_item.shelf_id = shelf.id
                
                # Log available containers
                current_app.logger.debug(f"Available containers for shelf {shelf.name}:")
                containers = db.query(StorageLevel2).filter_by(shelf_id=shelf.id).all()
                for container in containers:
                    current_app.logger.debug(f"- {container.id}: {container.name}")
                
                # Look up container by name and shelf_id
                container = db.query(StorageLevel2).filter(
                    StorageLevel2.name == loc_data['container'],
                    StorageLevel2.shelf_id == shelf.id
                ).first()
                
                if container:
                    current_app.logger.debug(f"Found container: {container.id} - {container.name}")
                    new_item.container_id = container.id
                else:
                    current_app.logger.warning(f"Container not found: {loc_data['container']}")
            else:
                current_app.logger.warning(f"Shelf not found: {loc_data['shelf']}")
        
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        # Verify the location was stored
        current_app.logger.debug(f"Stored item with shelf_id: {new_item.shelf_id}, container_id: {new_item.container_id}")
        
        return jsonify(new_item.to_dict())
        
    except Exception as e:
        current_app.logger.error(f"Error creating item: {str(e)}")
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()

@inventory_bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    db = SessionLocal()
    try:
        item = db.query(StoredItem).get(item_id)
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

@inventory_bp.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    db = SessionLocal()
    try:
        item = db.query(StoredItem).get(item_id)
        if not item:
            return jsonify({'error': 'Item not found'}), 404
            
        data = request.json
        for key, value in data.items():
            if hasattr(item, key):
                setattr(item, key, value)
                
        # Handle location update
        if data.get('selected_location'):
            loc_data = data['selected_location']
            shelf = db.query(StorageLevel1).filter_by(name=loc_data['shelf']).first()
            if shelf:
                item.shelf_id = shelf.id
                container = db.query(StorageLevel2).filter_by(
                    name=loc_data['container'],
                    shelf_id=shelf.id
                ).first()
                if container:
                    item.container_id = container.id
                    
        db.commit()
        return jsonify(item.to_dict())
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()