import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from .services.image_processor import process_image_data
from . import db # Import db from backend/__init__.py
from .models import Image

bp = Blueprint('api', __name__, url_prefix='/api')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        original_filename = secure_filename(file.filename)
        # Create a unique filename for storage to prevent overwrites and handle special chars
        ext = original_filename.rsplit('.', 1)[1].lower()
        storage_filename = f"{uuid.uuid4()}.{ext}"
        
        upload_folder = current_app.config['UPLOAD_FOLDER']
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        file_path = os.path.join(upload_folder, storage_filename)
        
        try:
            file.save(file_path)
        except Exception as e:
            current_app.logger.error(f"Error saving file: {e}")
            return jsonify({'error': 'Could not save uploaded file.'}), 500

        location_data = process_image_data(file_path)

        try:
            new_image_record = Image(
                original_filename=original_filename,
                storage_filename=storage_filename,
                latitude=location_data.get('latitude'),
                longitude=location_data.get('longitude'),
                address=location_data.get('address'), # Assuming process_image_data might return address
                mime_type=file.mimetype,
                file_size_bytes=os.path.getsize(file_path)
            )
            db.session.add(new_image_record)
            db.session.commit()
            
            response_data = {
                'message': 'Image uploaded and processed successfully.',
                'imageId': new_image_record.id,
                'filename': original_filename,
                'storageName': storage_filename,
                'latitude': new_image_record.latitude,
                'longitude': new_image_record.longitude,
                'address': new_image_record.address
            }
            return jsonify(response_data), 201
        except Exception as e:
            # If DB operation fails, attempt to delete the saved file
            if os.path.exists(file_path):
                os.remove(file_path)
            current_app.logger.error(f"Database error: {e}")
            return jsonify({'error': 'Could not save image metadata to database.'}), 500

    else:
        return jsonify({'error': 'Invalid image format. Allowed formats: png, jpg, jpeg, gif'}), 400
