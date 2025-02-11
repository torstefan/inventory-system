from database.db import Base, engine
from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3, ContainerType
from api.models.item import StoredItem
from api.routes.storage_init import init_storage
from api.models.embedding import ItemEmbedding

def init_database():
    print("Creating database tables...")
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
    
    # Initialize storage locations
    print("Initializing storage locations...")
    try:
        if init_storage():
            print("Storage locations initialized successfully")
        else:
            print("Storage locations already exist")
    except Exception as e:
        print(f"Error initializing storage: {str(e)}")

if __name__ == "__main__":
    init_database()
