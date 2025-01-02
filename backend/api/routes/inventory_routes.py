from flask import Blueprint, request, jsonify
from database.db import SessionLocal
from api.models.item import StoredItem
from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3
from sqlalchemy.orm import joinedload

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/items', methods=['POST'])
def create_item():
    data = request.json
    print("Received data:", data)  # Debug print
    db = SessionLocal()
    try:
        print("Creating new item with data:", data)  # Debug print
        
        new_item = StoredItem(
            category=data.get('category'),
            subcategory=data.get('subcategory'),
            brand=data.get('brand'),
            model=data.get('model'),
            condition=data.get('condition'),
            image_path=data.get('image_path'),
            notes=data.get('notes')
        )
        
        print("Created item object:", {
            'category': new_item.category,
            'subcategory': new_item.subcategory,
            'brand': new_item.brand,
            'model': new_item.model,
            'condition': new_item.condition
        })  # Debug print
        
        # Handle location if provided
        if 'selected_location' in data:
            location = data['selected_location']
            print("Processing location assignment:", location)
            
            if location and 'shelf' in location and 'container' in location:
                # Find the shelf
                shelf = db.query(StorageLevel1).filter_by(name=location['shelf']).first()
                print("Found shelf:", shelf.name if shelf else "None")
                
                if shelf:
                    # Find the container
                    container = db.query(StorageLevel2).filter_by(
                        shelf_id=shelf.id, 
                        name=location['container']
                    ).first()
                    print("Found container:", container.name if container else "None")
                    
                    if container:
                        # Create or find a default compartment
                        compartment = db.query(StorageLevel3).filter_by(
                            container_id=container.id,
                            name='default'
                        ).first()
                        
                        if not compartment:
                            print("Creating new default compartment for container:", container.name)
                            compartment = StorageLevel3(
                                container_id=container.id,
                                name='default',
                                description='Default compartment'
                            )
                            db.add(compartment)
                            db.flush()  # Get the ID without committing
                        
                        print("Setting level3_id to:", compartment.id)
                        new_item.level3_id = compartment.id
                    else:
                        print("Container not found:", location['container'])
                else:
                    print("Shelf not found:", location['shelf'])
            else:
                print("Invalid location data structure:", location)
        
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

@inventory_bp.route('/items', methods=['GET'])
def get_items():
    db = SessionLocal()
    try:
        # Use multiple joins to get the full location hierarchy
        items = db.query(StoredItem).options(
            joinedload(StoredItem.location).joinedload(StorageLevel3.container).joinedload(StorageLevel2.shelf)
        ).all()
        
        items_data = []
        for item in items:
            # Get the full location hierarchy
            location_info = {
                'shelf': None,
                'container': None
            }
            
            if item.location and item.location.container:
                container = item.location.container
                location_info['container'] = container.name
                if container.shelf:
                    location_info['shelf'] = container.shelf.name
                    
            print(f"Location info for item {item.id}: {location_info}")  # Debug print
            
            items_data.append({
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
            })
        
        return jsonify({'items': items_data})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
