# backend/api/routes/data_management.py

from flask import Blueprint, send_file, request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from database.db import SessionLocal, engine
from api.models.storage import StorageLevel1, StorageLevel2, StorageLevel3, ContainerType
from api.models.item import StoredItem
import json
import os
import shutil
import zipfile
from datetime import datetime
import logging
from pathlib import Path
import tempfile

data_management_bp = Blueprint('data_management', __name__)
logger = logging.getLogger(__name__)

STATIC_DIR = Path(__file__).resolve().parent.parent.parent / 'static'
UPLOAD_DIR = STATIC_DIR / 'uploads'

def create_backup():
    """
    Create a backup of the database and images.
    Returns: Path to the created zip file
    """
    try:
        # Create a temporary directory for our backup
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            backup_path = temp_path / 'backup'
            backup_path.mkdir()
            
            # Create images directory in backup
            images_backup_path = backup_path / 'images'
            images_backup_path.mkdir()
            
            # Copy all images
            for image_file in UPLOAD_DIR.glob('*.*'):
                if image_file.is_file():
                    shutil.copy2(image_file, images_backup_path / image_file.name)
            
            # Export database records
            db = SessionLocal()
            try:
                # Get all records
                shelves = db.query(StorageLevel1).all()
                containers = db.query(StorageLevel2).all()
                compartments = db.query(StorageLevel3).all()
                items = db.query(StoredItem).all()
                
                # Create data structure
                data = {
                    'metadata': {
                        'version': '1.0',
                        'date': datetime.utcnow().isoformat(),
                        'type': 'inventory_backup'
                    },
                    'storage': {
                        'shelves': [
                            {
                                'id': shelf.id,
                                'name': shelf.name,
                                'description': shelf.description
                            } for shelf in shelves
                        ],
                        'containers': [
                            {
                                'id': container.id,
                                'shelf_id': container.shelf_id,
                                'name': container.name,
                                'container_type': container.container_type.value,
                                'description': container.description
                            } for container in containers
                        ],
                        'compartments': [
                            {
                                'id': comp.id,
                                'container_id': comp.container_id,
                                'name': comp.name,
                                'description': comp.description
                            } for comp in compartments
                        ]
                    },
                    'items': [
                        {
                            'id': item.id,
                            'category': item.category,
                            'subcategory': item.subcategory,
                            'brand': item.brand,
                            'model': item.model,
                            'condition': item.condition,
                            'technical_details': item.technical_details,
                            'shelf_id': item.shelf_id,
                            'container_id': item.container_id,
                            'image_path': item.image_path,
                            'date_added': item.date_added.isoformat() if item.date_added else None,
                            'last_modified': item.last_modified.isoformat() if item.last_modified else None
                        } for item in items
                    ]
                }
                
                # Write data to JSON file
                with open(backup_path / 'data.json', 'w') as f:
                    json.dump(data, f, indent=2)
                
                # Create ZIP archive
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                zip_filename = f'inventory_backup_{timestamp}.zip'
                zip_path = temp_path / zip_filename
                
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    # Add all files from backup directory
                    for root, _, files in os.walk(backup_path):
                        for file in files:
                            file_path = Path(root) / file
                            arcname = file_path.relative_to(backup_path)
                            zipf.write(file_path, arcname)
                
                # Copy the zip to a more permanent location
                final_zip_path = STATIC_DIR / zip_filename
                shutil.copy2(zip_path, final_zip_path)
                
                return final_zip_path
                
            finally:
                db.close()
                
    except Exception as e:
        logger.error(f"Error creating backup: {str(e)}", exc_info=True)
        raise

def restore_backup(zip_path):
    """
    Restore database and images from a backup zip file.
    """
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Extract zip
            with zipfile.ZipFile(zip_path, 'r') as zipf:
                zipf.extractall(temp_path)
            
            # Verify backup data
            data_file = temp_path / 'data.json'
            if not data_file.exists():
                raise ValueError("Invalid backup file: missing data.json")
            
            with open(data_file, 'r') as f:
                data = json.load(f)
            
            # Verify metadata
            if not data.get('metadata', {}).get('type') == 'inventory_backup':
                raise ValueError("Invalid backup file: incorrect format")
            
            db = SessionLocal()
            try:
                # Clear existing data
                db.query(StoredItem).delete()
                db.query(StorageLevel3).delete()
                db.query(StorageLevel2).delete()
                db.query(StorageLevel1).delete()
                
                # Restore storage structure
                shelf_id_map = {}  # Map old IDs to new IDs
                container_id_map = {}
                
                # Restore shelves
                for shelf_data in data['storage']['shelves']:
                    shelf = StorageLevel1(
                        name=shelf_data['name'],
                        description=shelf_data['description']
                    )
                    db.add(shelf)
                    db.flush()
                    shelf_id_map[shelf_data['id']] = shelf.id
                
                # Restore containers
                for container_data in data['storage']['containers']:
                    container = StorageLevel2(
                        shelf_id=shelf_id_map[container_data['shelf_id']],
                        name=container_data['name'],
                        container_type=ContainerType(container_data['container_type']),
                        description=container_data['description']
                    )
                    db.add(container)
                    db.flush()
                    container_id_map[container_data['id']] = container.id
                
                # Restore compartments
                for comp_data in data['storage']['compartments']:
                    compartment = StorageLevel3(
                        container_id=container_id_map[comp_data['container_id']],
                        name=comp_data['name'],
                        description=comp_data['description']
                    )
                    db.add(compartment)
                
                # Restore items
                for item_data in data['items']:
                    item = StoredItem(
                        category=item_data['category'],
                        subcategory=item_data['subcategory'],
                        brand=item_data['brand'],
                        model=item_data['model'],
                        condition=item_data['condition'],
                        technical_details=item_data['technical_details'],
                        shelf_id=shelf_id_map.get(item_data['shelf_id']),
                        container_id=container_id_map.get(item_data['container_id']),
                        image_path=item_data['image_path'],
                        date_added=datetime.fromisoformat(item_data['date_added']) if item_data['date_added'] else None,
                        last_modified=datetime.fromisoformat(item_data['last_modified']) if item_data['last_modified'] else None
                    )
                    db.add(item)
                
                # Restore images
                images_dir = temp_path / 'images'
                if images_dir.exists():
                    # Clear existing images
                    for file in UPLOAD_DIR.glob('*.*'):
                        if file.is_file():
                            file.unlink()
                    
                    # Copy new images
                    for image_file in images_dir.glob('*.*'):
                        if image_file.is_file():
                            shutil.copy2(image_file, UPLOAD_DIR / image_file.name)
                
                db.commit()
                return True
                
            except Exception as e:
                db.rollback()
                raise
            finally:
                db.close()
                
    except Exception as e:
        logger.error(f"Error restoring backup: {str(e)}", exc_info=True)
        raise

# API Routes
@data_management_bp.route('/backup', methods=['POST'])
def create_backup_endpoint():
    """Create and download a backup of the entire system"""
    try:
        backup_file = create_backup()
        return send_file(
            backup_file,
            as_attachment=True,
            download_name=backup_file.name
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@data_management_bp.route('/restore', methods=['POST'])
def restore_backup_endpoint():
    """Restore the system from a backup file"""
    if 'backup' not in request.files:
        return jsonify({'error': 'No backup file provided'}), 400
        
    file = request.files['backup']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file.save(temp_file.name)
            restore_backup(temp_file.name)
            
        return jsonify({'message': 'Backup restored successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'temp_file' in locals():
            os.unlink(temp_file.name)

# CLI interface
if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Inventory System Backup/Restore Utility')
    parser.add_argument('action', choices=['backup', 'restore'], help='Action to perform')
    parser.add_argument('--file', help='Backup file for restore action')
    
    args = parser.parse_args()
    
    try:
        if args.action == 'backup':
            backup_file = create_backup()
            print(f"Backup created successfully: {backup_file}")
        else:
            if not args.file:
                parser.error("--file is required for restore action")
            restore_backup(args.file)
            print("Restore completed successfully")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
