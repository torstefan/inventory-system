# backend/init_db.py

from database.db import Base, engine
from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3
from api.models.item import StoredItem

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()
