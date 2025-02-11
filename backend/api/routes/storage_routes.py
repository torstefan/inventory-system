# backend/api/routes/storage_routes.py

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database.db import SessionLocal
from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3, ContainerType
import logging

storage_bp = Blueprint('storage', __name__)
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


@storage_bp.route('/level1/<int:shelf_id>', methods=['PUT'])
async def update_shelf(shelf_id):
    try:
        data = await request.get_json()
        logger.debug(f"Updating shelf {shelf_id} with data: {data}")
        
        with SessionLocal() as db:
            shelf = db.query(StorageLevel1).filter_by(id=shelf_id).first()
            if not shelf:
                return {'error': 'Shelf not found'}, 404
                
            if 'name' in data:
                if data['name'] != shelf.name:
                    existing = db.query(StorageLevel1).filter_by(name=data['name']).first()
                    if existing:
                        return {'error': 'A shelf with this name already exists'}, 400
                shelf.name = data['name']
                
            if 'description' in data:
                shelf.description = data['description']
                
            db.commit()
            return shelf.to_dict()
            
    except Exception as e:
        logger.error(f"Error updating shelf: {str(e)}")
        return {'error': str(e)}, 400

@storage_bp.route('/level2/<int:container_id>', methods=['PUT'])
async def update_container(container_id):
    try:
        data = await request.get_json()
        logger.debug(f"Updating container {container_id} with data: {data}")
        
        with SessionLocal() as db:
            container = db.query(StorageLevel2).filter_by(id=container_id).first()
            if not container:
                return {'error': 'Container not found'}, 404
                
            if 'name' in data:
                container.name = data['name']
            if 'description' in data:
                container.description = data['description']
            if 'containerType' in data:
                container.container_type = ContainerType(data['containerType'])
                
            db.commit()
            return container.to_dict()
            
    except Exception as e:
        logger.error(f"Error updating container: {str(e)}")
        return {'error': str(e)}, 400

@storage_bp.route('/level1/<int:shelf_id>', methods=['DELETE'])
async def delete_shelf(shelf_id):
    try:
        with SessionLocal() as db:
            shelf = db.query(StorageLevel1).filter_by(id=shelf_id).first()
            if not shelf:
                return {'error': 'Shelf not found'}, 404
                
            db.delete(shelf)
            db.commit()
            return {'message': 'Shelf deleted successfully'}
            
    except Exception as e:
        logger.error(f"Error deleting shelf: {str(e)}")
        return {'error': str(e)}, 400

@storage_bp.route('/level2/<int:container_id>', methods=['DELETE'])
async def delete_container(container_id):
    try:
        with SessionLocal() as db:
            container = db.query(StorageLevel2).filter_by(id=container_id).first()
            if not container:
                return {'error': 'Container not found'}, 404
                
            db.delete(container)
            db.commit()
            return {'message': 'Container deleted successfully'}
            
    except Exception as e:
        logger.error(f"Error deleting container: {str(e)}")
        return {'error': str(e)}, 400


@storage_bp.route('/level1', methods=['POST'])
async def create_shelf():
    try:
        data = await request.get_json()
        with SessionLocal() as db:
            shelf = StorageLevel1(name=data['name'])
            db.add(shelf)
            db.commit()
            db.refresh(shelf)
            return shelf.to_dict()
    except Exception as e:
        logger.error(f"Error creating shelf: {str(e)}")
        return {'error': str(e)}, 500

@storage_bp.route('/level1', methods=['GET'])
async def get_shelves():
    try:
        with SessionLocal() as db:
            shelves = db.query(StorageLevel1).all()
            return {'shelves': [shelf.to_dict() for shelf in shelves]}
    except Exception as e:
        logger.error(f"Error fetching shelves: {str(e)}")
        return {'error': str(e)}, 500


@storage_bp.route('/level2', methods=['POST'])
async def create_container():
    try:
        data = await request.get_json()
        with SessionLocal() as db:
            new_container = StorageLevel2(
                shelf_id=data['shelfId'],
                name=data['name'],
                container_type=ContainerType(data['containerType']),
                description=data.get('description')
            )
            
            db.add(new_container)
            db.commit()
            db.refresh(new_container)
            return new_container.to_dict()
    except Exception as e:
        logger.error(f"Error creating container: {str(e)}")
        return {'error': str(e)}, 400

@storage_bp.route('/level3', methods=['POST'])
async def create_compartment():
    try:
        data = await request.get_json()
        with SessionLocal() as db:
            new_compartment = StorageLevel3(
                container_id=data['containerId'],
                name=data['name'],
                description=data.get('description')
            )
            
            db.add(new_compartment)
            db.commit()
            db.refresh(new_compartment)
            return new_compartment.to_dict()
    except Exception as e:
        logger.error(f"Error creating compartment: {str(e)}")
        return {'error': str(e)}, 400

# Add route to get full storage hierarchy
@storage_bp.route('/hierarchy', methods=['GET'])
async def get_hierarchy():
    """Get the full storage hierarchy"""
    try:
        with SessionLocal() as db:
            shelves = db.query(StorageLevel1).all()
            logger.debug(f"Found {len(shelves)} shelves in database")
            if not shelves:
                return {'message': 'No storage locations defined yet.'}, 404
                
            result = {
                'shelves': [{
                    'level1': shelf.to_dict(),
                    'level2': [container.to_dict() for container in shelf.containers]
                } for shelf in shelves]
            }
            logger.debug(f"Returning hierarchy: {result}")
            return result
            
    except Exception as e:
        logger.error(f"Error getting hierarchy: {str(e)}")
        return {'error': str(e)}, 500
