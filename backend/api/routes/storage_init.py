from quart import Blueprint
import logging
from database.db import SessionLocal
from api.models.storage import StorageLevel1, StorageLevel2, ContainerType

init_bp = Blueprint('init', __name__)
logger = logging.getLogger(__name__)

@init_bp.route('/init-storage', methods=['POST'])
async def initialize_storage():
    """Initialize storage with default shelves and containers"""
    try:
        logger.debug("Starting storage initialization")
        with SessionLocal() as db:
            try:
                # Check if storage is already initialized
                existing = db.query(StorageLevel1).first()
                if existing:
                    logger.debug("Storage already initialized")
                    return {'message': 'Storage already initialized', 'status': 'ok'}, 200

                # Create default shelves
                shelves = [
                    StorageLevel1(name="Components Shelf", description="Electronic components and small parts"),
                    StorageLevel1(name="Tools Shelf", description="Tools and equipment"),
                    StorageLevel1(name="Actuators Shelf", description="Motors, servos, and actuators")
                ]
                db.add_all(shelves)
                db.flush()
                logger.debug(f"Created {len(shelves)} shelves")

                # Create default containers
                containers = []
                for shelf in shelves:
                    containers.extend([
                        StorageLevel2(
                            shelf_id=shelf.id,
                            name=f"{shelf.name} Box 1",
                            container_type=ContainerType.BOX,
                            description=f"First box in {shelf.name}"
                        ),
                        StorageLevel2(
                            shelf_id=shelf.id,
                            name=f"{shelf.name} Drawer 1",
                            container_type=ContainerType.DRAWER,
                            description=f"First drawer in {shelf.name}"
                        )
                    ])
                
                db.add_all(containers)
                db.commit()
                logger.debug(f"Created {len(containers)} containers")
                
                return {
                    'message': 'Storage initialized successfully',
                    'status': 'ok',
                    'shelves': len(shelves),
                    'containers': len(containers)
                }
                
            except Exception as e:
                db.rollback()
                logger.error(f"Database error during initialization: {str(e)}")
                return {'error': str(e), 'status': 'error'}, 500
                
    except Exception as e:
        logger.error(f"Error initializing storage: {str(e)}")
        return {'error': str(e), 'status': 'error'}, 500

# Optional: Run directly to initialize storage
if __name__ == "__main__":
    init_storage()
