# backend/api/routes/storage_routes.py

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database.db import SessionLocal
from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3, ContainerType

storage_bp = Blueprint('storage', __name__)

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


@storage_bp.route('/level1/<int:shelf_id>', methods=['PUT'])
def update_shelf(shelf_id):
    try:
        data = request.get_json()
        current_app.logger.debug(f"Updating shelf {shelf_id} with data: {data}")
        
        db = get_db()
        shelf = db.query(StorageLevel1).filter_by(id=shelf_id).first()
        
        if not shelf:
            return jsonify({'error': 'Shelf not found'}), 404
            
        if 'name' in data:
            # Check for duplicate name if name is being changed
            if data['name'] != shelf.name:
                existing = db.query(StorageLevel1).filter_by(name=data['name']).first()
                if existing:
                    return jsonify({'error': 'A shelf with this name already exists'}), 400
            shelf.name = data['name']
            
        if 'description' in data:
            shelf.description = data['description']
            
        db.commit()
        return jsonify({
            'id': shelf.id,
            'name': shelf.name,
            'description': shelf.description
        })
        
    except Exception as e:
        current_app.logger.error(f"Error updating shelf: {str(e)}")
        return jsonify({'error': str(e)}), 400

@storage_bp.route('/level2/<int:container_id>', methods=['PUT'])
def update_container(container_id):
    try:
        data = request.get_json()
        current_app.logger.debug(f"Updating container {container_id} with data: {data}")
        
        db = get_db()
        container = db.query(StorageLevel2).filter_by(id=container_id).first()
        
        if not container:
            return jsonify({'error': 'Container not found'}), 404
            
        if 'name' in data:
            container.name = data['name']
        if 'description' in data:
            container.description = data['description']
        if 'containerType' in data:
            container.container_type = ContainerType(data['containerType'])
            
        db.commit()
        return jsonify({
            'id': container.id,
            'name': container.name,
            'description': container.description,
            'containerType': container.container_type.value
        })
        
    except Exception as e:
        current_app.logger.error(f"Error updating container: {str(e)}")
        return jsonify({'error': str(e)}), 400

@storage_bp.route('/level1/<int:shelf_id>', methods=['DELETE'])
def delete_shelf(shelf_id):
    try:
        db = get_db()
        shelf = db.query(StorageLevel1).filter_by(id=shelf_id).first()
        
        if not shelf:
            return jsonify({'error': 'Shelf not found'}), 404
            
        # This will cascade delete all containers due to SQLAlchemy relationship
        db.delete(shelf)
        db.commit()
        
        return jsonify({'message': 'Shelf deleted successfully'})
        
    except Exception as e:
        current_app.logger.error(f"Error deleting shelf: {str(e)}")
        return jsonify({'error': str(e)}), 400

@storage_bp.route('/level2/<int:container_id>', methods=['DELETE'])
def delete_container(container_id):
    try:
        db = get_db()
        container = db.query(StorageLevel2).filter_by(id=container_id).first()
        
        if not container:
            return jsonify({'error': 'Container not found'}), 404
            
        db.delete(container)
        db.commit()
        
        return jsonify({'message': 'Container deleted successfully'})
        
    except Exception as e:
        current_app.logger.error(f"Error deleting container: {str(e)}")
        return jsonify({'error': str(e)}), 400


@storage_bp.route('/level1', methods=['POST'])
def create_shelf():
    try:
        data = request.get_json()
        current_app.logger.debug(f"Received shelf data: {data}")

        if not data:
            current_app.logger.error("No JSON data received")
            return jsonify({'error': 'No data provided'}), 400

        if 'name' not in data:
            current_app.logger.error("No name provided in data")
            return jsonify({'error': 'Name is required'}), 400

        db = get_db()

        # Check if shelf name already exists
        existing_shelf = db.query(StorageLevel1).filter(
            StorageLevel1.name == data['name']
        ).first()

        if existing_shelf:
            current_app.logger.warning(f"Attempt to create duplicate shelf name: {data['name']}")
            return jsonify({
                'error': 'A shelf with this name already exists',
                'code': 'duplicate_name'
            }), 400

        new_shelf = StorageLevel1(
            name=data['name'],
            description=data.get('description', '')
        )

        db.add(new_shelf)
        db.commit()
        db.refresh(new_shelf)

        current_app.logger.info(f"Created new shelf: {new_shelf.name}")
        return jsonify({
            'id': new_shelf.id,
            'name': new_shelf.name,
            'description': new_shelf.description
        })

    except IntegrityError as e:
        db.rollback()
        current_app.logger.error(f"Database integrity error: {str(e)}")
        return jsonify({
            'error': 'A shelf with this name already exists',
            'code': 'duplicate_name'
        }), 400

    except Exception as e:
        current_app.logger.error(f"Error creating shelf: {str(e)}")
        return jsonify({'error': str(e)}), 400

@storage_bp.route('/level1', methods=['GET'])
def get_shelves():
    try:
        db = get_db()
        shelves = db.query(StorageLevel1).all()
        return jsonify([{
            'level1': {
                'id': shelf.id,
                'name': shelf.name,
                'description': shelf.description
            },
            'level2': [{
                'id': container.id,
                'name': container.name,
                'containerType': container.container_type.value,
                'description': container.description
            } for container in shelf.containers]
        } for shelf in shelves])
    except Exception as e:
        current_app.logger.error(f"Error fetching shelves: {str(e)}")
        return jsonify({'error': str(e)}), 500


@storage_bp.route('/level2', methods=['POST'])
def create_container():
    data = request.json
    db = get_db()
    
    new_container = StorageLevel2(
        shelf_id=data['shelfId'],
        name=data['name'],
        container_type=ContainerType(data['containerType']),
        description=data.get('description')
    )
    
    try:
        db.add(new_container)
        db.commit()
        db.refresh(new_container)
        return jsonify({
            'id': new_container.id,
            'shelfId': new_container.shelf_id,
            'name': new_container.name,
            'containerType': new_container.container_type.value,
            'description': new_container.description
        })
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400

@storage_bp.route('/level3', methods=['POST'])
def create_compartment():
    data = request.json
    db = get_db()
    
    new_compartment = StorageLevel3(
        container_id=data['containerId'],
        name=data['name'],
        description=data.get('description')
    )
    
    try:
        db.add(new_compartment)
        db.commit()
        db.refresh(new_compartment)
        return jsonify({
            'id': new_compartment.id,
            'containerId': new_compartment.container_id,
            'name': new_compartment.name,
            'description': new_compartment.description
        })
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400

# Add route to get full storage hierarchy
@storage_bp.route('/hierarchy', methods=['GET'])
def get_hierarchy():
    db = get_db()
    shelves = db.query(StorageLevel1).all()
    
    return jsonify([{
        'level1': {
            'id': shelf.id,
            'name': shelf.name,
            'description': shelf.description
        },
        'level2': [{
            'id': container.id,
            'name': container.name,
            'containerType': container.container_type.value,
            'description': container.description,
            'level3': [{
                'id': compartment.id,
                'name': compartment.name,
                'description': compartment.description
            } for compartment in container.compartments]
        } for container in shelf.containers]
    } for shelf in shelves])
