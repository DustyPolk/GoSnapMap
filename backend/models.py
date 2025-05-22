from . import db # Import db instance from backend/__init__.py

class Image(db.Model):
    __tablename__ = 'images' # Explicit table name is good practice

    id = db.Column(db.Integer, primary_key=True)
    original_filename = db.Column(db.Text, nullable=False)
    storage_filename = db.Column(db.Text, nullable=False, unique=True)
    # Use db.func.now() for SQLAlchemy < 2.0, or datetime.utcnow for newer versions with appropriate dialect config
    uploaded_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    address = db.Column(db.Text, nullable=True) # For reverse geocoded address
    caption = db.Column(db.Text, nullable=True)
    mime_type = db.Column(db.Text, nullable=True)
    file_size_bytes = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f'<Image {self.original_filename} (ID: {self.id})>'
