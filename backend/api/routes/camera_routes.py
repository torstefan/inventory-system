# backend/api/routes/camera_routes.py

from flask import Blueprint, request, jsonify, current_app
import subprocess
import shlex
import logging

camera_bp = Blueprint('camera', __name__)
logger = logging.getLogger(__name__)

@camera_bp.route('/set-focus', methods=['POST'])
def set_focus():
    try:
        data = request.get_json()
        device = data.get('device', '/dev/video0')
        focus = data.get('focus', 0)

        # Construct and execute the v4l2-ctl command
        command = f"v4l2-ctl -d {device} --set-ctrl=focus_absolute={focus}"
        logger.debug(f"Executing command: {command}")
        
        process = subprocess.run(
            shlex.split(command),
            capture_output=True,
            text=True
        )
        
        if process.returncode != 0:
            logger.error(f"Error setting focus: {process.stderr}")
            return jsonify({
                'error': 'Failed to set focus',
                'details': process.stderr
            }), 500
            
        return jsonify({
            'success': True,
            'device': device,
            'focus': focus
        })
        
    except Exception as e:
        logger.error(f"Error in set_focus: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
