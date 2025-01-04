# backend/init_db.py
from database.db import engine, Base
from api.models.item import StoredItem
from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3

def init_db():
    print("Creating database tables...")
    # Drop all existing tables
    Base.metadata.drop_all(bind=engine)
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
