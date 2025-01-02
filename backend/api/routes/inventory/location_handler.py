# backend/api/routes/inventory/location_handler.py

from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3

def handle_location_assignment(db, item, location_data):
    """Handle the assignment of a location to an item"""
    if not location_data or 'shelf' not in location_data or 'container' not in location_data:
        print("Invalid location data structure:", location_data)
        return

    # Find the shelf
    shelf = db.query(StorageLevel1).filter_by(name=location_data['shelf']).first()
    if not shelf:
        print("Shelf not found:", location_data['shelf'])
        return

    # Find the container
    container = db.query(StorageLevel2).filter_by(
        shelf_id=shelf.id,
        name=location_data['container']
    ).first()
    if not container:
        print("Container not found:", location_data['container'])
        return

    # Create or find default compartment
    compartment = get_or_create_default_compartment(db, container)
    
    # Assign the compartment to the item
    item.level3_id = compartment.id

def get_or_create_default_compartment(db, container):
    """Get or create a default compartment for a container"""
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
        db.flush()
    
    return compartment
