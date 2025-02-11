from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.models.storage import StorageLevel2, ContainerType

def migrate_container_types():
    """Migrate old container types to new ones"""
    engine = create_engine('sqlite:///inventory.db')
    Session = sessionmaker(bind=engine)
    
    with Session() as session:
        containers = session.query(StorageLevel2).all()
        
        for container in containers:
            if container.container_type in [ContainerType.REGULAR_BOX, ContainerType.DRAWER_ORGANIZER]:
                container.container_type = ContainerType.migrate_legacy(container.container_type)
        
        session.commit()

if __name__ == "__main__":
    migrate_container_types() 