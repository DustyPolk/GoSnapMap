import React, { useState } from 'react';
import PhotoMap from './PhotoMap';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null); // { lat: number, lon: number } | null
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setLocation(null); // Reset location when a new file is selected
      setError(null);
      setSuccess(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreview(null);
      setLocation(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file first!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // console.log('Uploading image:', selectedFile.name); // Keep for debugging if needed
      const response = await fetch('http://127.0.0.1:5000/api/upload_image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error, server did not return JSON.' }));
        throw new Error(`${response.status} ${response.statusText}: ${errorData.message || 'No additional error message provided.'}`);
      }

      const result = await response.json();
      setSuccess(result.message); 
      // console.log('Upload result:', result); // Keep for debugging if needed

      if (result.latitude != null && result.longitude != null) {
        setLocation({ lat: result.latitude, lon: result.longitude });
      } else {
        setLocation(null); 
      }

      setSelectedFile(null); // Reset file input after successful upload
      // Preview is kept for UX
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Error uploading image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setLocation(null);
    setError(null);
    setSuccess(null);
    // Also reset the file input visually if possible (though this is tricky with controlled file inputs)
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = ""; // Attempt to clear the file input field
    }
  };

  return (
    // layout-container and its variants are managed in App.css for overall page structure
    <div className={`layout-container ${location && location.lat != null && location.lon != null ? 'with-map' : 'centered'}`}>
      <div className="upload-section"> {/* This class is used for the grid layout in App.css */}
        <div className="upload-container card"> {/* Added 'card' for consistent styling if desired, or can be styled directly */}
          <h2>Upload Your Photo</h2>
          <p className="subtitle">Upload a photo with location data to see where it was taken</p>
          
          <div className="file-input-wrapper">
            <label htmlFor="file-upload" className="file-input-label">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
                {/* Using a simpler, more modern icon: Upload/Cloud icon */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12l-3.5 3.5M12 12l3.5 3.5" />

              </svg>
              {selectedFile ? selectedFile.name : 'Choose or drop a photo'}
            </label>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          {preview && (
            <div className="preview-container">
              <img src={preview} alt="Selected preview" className="preview-image" />
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="button-group">
            {preview && ( // Show "New Photo" button only if there's a preview
              <button onClick={resetForm} disabled={isLoading} className="button-secondary">
                New Photo
              </button>
            )}
            <button onClick={handleSubmit} disabled={!selectedFile || isLoading}>
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div> {/* Removed inline style */}
                  Processing...
                </>
              ) : 'Upload & Locate'}
            </button>
          </div>
        </div>
      </div>

      {location && location.lat != null && location.lon != null && (
        <div className="map-section"> {/* This class is used for the grid layout in App.css */}
          <div className="location-info card"> {/* Added 'card' for consistent styling */}
            <h3>Photo Location Found!</h3>
            <p>Coordinates: {location.lat.toFixed(6)}, {location.lon.toFixed(6)}</p>
          </div>
          <div className="map-container card"> {/* Added 'card' for consistent styling */}
            <PhotoMap latitude={location.lat} longitude={location.lon} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
