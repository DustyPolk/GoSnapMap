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
      console.log('Uploading image:', selectedFile.name);
      const response = await fetch('http://127.0.0.1:5000/api/upload_image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error, server did not return JSON.' }));
        throw new Error(`${response.status} ${response.statusText}: ${errorData.message || 'No additional error message provided.'}`);
      }

      const result = await response.json();
      setSuccess(result.message); // Use the message directly from the backend
      console.log('Upload result:', result);

      if (result.latitude != null && result.longitude != null) {
        setLocation({ lat: result.latitude, lon: result.longitude });
      } else {
        setLocation(null); // No location data from backend
      }

      // Reset form
      setSelectedFile(null);
      // Keep preview for better UX
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
  };

  return (
    <div className={`layout-container fade-in ${location && location.lat != null && location.lon != null ? 'with-map' : 'centered'}`}>
      <div className="upload-section">
        <div className="upload-container">
          <h2>Upload Your Photo</h2>
          <p className="subtitle">Upload a photo with location data to see where it was taken</p>
          
          <div className="file-input-wrapper">
            <label htmlFor="file-upload" className="file-input-label">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {selectedFile ? selectedFile.name : 'Choose a photo'}
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
            <div className="error-message" style={{ color: 'var(--error-color)', padding: '10px', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" style={{ color: 'var(--success-color)', padding: '10px', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
              {success}
            </div>
          )}

          <div className="button-group" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            {preview && (
              <button onClick={resetForm} disabled={isLoading} style={{ backgroundColor: 'var(--text-medium)' }}>
                New Photo
              </button>
            )}
            <button onClick={handleSubmit} disabled={!selectedFile || isLoading}>
              {isLoading ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: '0' }}></div>
                  Processing...
                </>
              ) : 'Upload & Locate'}
            </button>
          </div>
        </div>
      </div>

      {location && location.lat != null && location.lon != null && (
        <div className="map-section fade-in">
          <div className="location-info">
            <h3>Photo Location Found!</h3>
            <p>Coordinates: {location.lat.toFixed(6)}, {location.lon.toFixed(6)}</p>
          </div>
          <div className="map-container">
            <PhotoMap latitude={location.lat} longitude={location.lon} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
