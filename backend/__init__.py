import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env or .flaskenv

db = SQLAlchemy()

def create_app(config_name=None):
    app = Flask(__name__, instance_relative_config=True)

    # Configuration
    # Default configuration
    # Ensure the instance folder exists (Flask does this by default for instance_relative_config=True if instance folder is named 'instance')
    # but explicit creation here for clarity and control if needed, or rely on Flask's default behavior.
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError as e:
        app.logger.error(f"Error creating instance folder {app.instance_path}: {e}")

    # Construct the default database URI using app.instance_path
    # This ensures the database is always inside the project's 'instance' folder (e.g., 'D:\\projects\\photo_map_project\\instance\\')
    default_db_path = os.path.join(app.instance_path, 'photomap.db')
    # Ensure forward slashes for SQLite URI, especially on Windows.
    default_sqlite_uri = f"sqlite:///{default_db_path.replace('\\', '/')}"

    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_secret_key_should_be_random'),
        # DATABASE_URL from .flaskenv (e.g. 'sqlite:///instance/photomap.db') can override this default.
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', default_sqlite_uri),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        # UPLOAD_FOLDER from .flaskenv ('backend/static/uploads') is relative to project root.
        # The default here is also relative to project root for consistency.
        UPLOAD_FOLDER=os.environ.get('UPLOAD_FOLDER', 'backend/static/uploads')
    )

    # Load instance config if it exists, e.g., config.py
    # app.config.from_pyfile('config.py', silent=True)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError as e:
        app.logger.error(f"Error creating instance folder {app.instance_path}: {e}")

    # Ensure the upload folder exists. UPLOAD_FOLDER is now relative to the project root.
    # We make it an absolute path here.
    # os.getcwd() when 'flask run' is executed will be the project root directory.
    # app.config['UPLOAD_FOLDER'] is loaded from .flaskenv in the project root.
    absolute_upload_folder = os.path.abspath(app.config['UPLOAD_FOLDER'])
    try:
        os.makedirs(absolute_upload_folder, exist_ok=True)
        app.config['UPLOAD_FOLDER'] = absolute_upload_folder # Store absolute path
    except OSError as e:
        app.logger.error(f"Error creating upload folder {absolute_upload_folder}: {e}")

    # Initialize extensions
    db.init_app(app)
    CORS(app) # Configure more strictly for production

    with app.app_context():
        from . import models # Import models to ensure they are registered with SQLAlchemy
        db.create_all()     # Create database tables for all models

        from . import routes # Import and register blueprints
        app.register_blueprint(routes.bp)

    @app.route('/hello-init') # Test route
    def hello_init():
        return 'Hello from backend/__init__.py!'

    return app
