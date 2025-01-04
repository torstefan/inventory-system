from flask import Blueprint, jsonify
from database.db import SessionLocal
from api.models.storage import StorageLevel1, StorageLevel2, ContainerType

init_bp = Blueprint('init', __name__)

def init_storage():
    db = SessionLocal()
    try:
        # Only initialize if no shelves exist
        if db.query(StorageLevel1).first() is None:
            # Create shelves
            shelf_a = StorageLevel1(name="Components Shelf", description="Electronic components and small parts")
            shelf_b = StorageLevel1(name="Tools Shelf", description="Tools and equipment")
            shelf_c = StorageLevel1(name="Actuators Shelf", description="Motors, servos, and actuators")
            
            db.add_all([shelf_a, shelf_b, shelf_c])
            db.flush()  # Get IDs for the shelves
            
            # Create containers for Components Shelf
            containers_a = [
                StorageLevel2(
                    shelf_id=shelf_a.id,
                    name="Small Components Box",
                    container_type=ContainerType.REGULAR_BOX,
                    description="Resistors, capacitors, and small ICs"
                ),
                StorageLevel2(
                    shelf_id=shelf_a.id,
                    name="MCU Container",
                    container_type=ContainerType.DRAWER_ORGANIZER,
                    description="Microcontrollers and development boards"
                )
            ]
            
            # Create containers for Tools Shelf
            containers_b = [
                StorageLevel2(
                    shelf_id=shelf_b.id,
                    name="Hand Tools Box",
                    container_type=ContainerType.REGULAR_BOX,
                    description="Screwdrivers, pliers, and wrenches"
                ),
                StorageLevel2(
                    shelf_id=shelf_b.id,
                    name="Test Equipment",
                    container_type=ContainerType.DRAWER_ORGANIZER,
                    description="Multimeters and testing tools"
                )
            ]
            
            # Create containers for Actuators Shelf
            containers_c = [
                StorageLevel2(
                    shelf_id=shelf_c.id,
                    name="Servo Box",
                    container_type=ContainerType.REGULAR_BOX,
                    description="Various servo motors"
                ),
                StorageLevel2(
                    shelf_id=shelf_c.id,
                    name="DC Motors",
                    container_type=ContainerType.DRAWER_ORGANIZER,
                    description="DC motors and gearboxes"
                )
            ]
            
            db.add_all(containers_a + containers_b + containers_c)
            db.commit()
            
            return True
        return False
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

@init_bp.route('/init-storage', methods=['POST'])
def initialize_storage():
    try:
        if init_storage():
            return jsonify({'message': 'Storage initialized successfully'}), 201
        return jsonify({'message': 'Storage already initialized'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Optional: Run directly to initialize storage
if __name__ == "__main__":
    init_storage()
