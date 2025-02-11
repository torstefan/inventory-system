# backend/api/routes/camera_routes.py

from quart import Blueprint, request
import logging

camera_bp = Blueprint('camera', __name__)
logger = logging.getLogger(__name__)

@camera_bp.route('/set-focus', methods=['POST'])
async def set_focus():
    try:
        data = await request.get_json()
        focus_value = data.get('focus')
        if focus_value is None:
            return {'error': 'Focus value not provided'}, 400
            
        # ... camera focus logic ...
        return {'message': 'Focus set successfully'}
    except Exception as e:
        logger.error(f"Error setting focus: {str(e)}")
        return {'error': str(e)}, 500
