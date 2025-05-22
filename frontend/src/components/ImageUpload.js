import React, { useState } from 'react';
import PhotoMap from './PhotoMap'; // Import the PhotoMap component

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null); // { lat: number, lon: number } | null

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setLocation(null); // Reset location when a new file is selected
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
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      console.log('Attempting to upload image:', selectedFile.name);
      const response = await fetch('http://127.0.0.1:5000/api/upload_image', {
        method: 'POST',
        body: formData,
        // Note: Don't set 'Content-Type': 'multipart/form-data' manually for FormData.
        // The browser will do it automatically with the correct boundary.
      });

      if (!response.ok) {
        // Try to get error message from backend response body
        const errorData = await response.json().catch(() => ({ message: 'Unknown error, server did not return JSON.' }));
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Server message: ${errorData.message || 'No additional error message provided.'}`);
      }

      const result = await response.json();
      alert('Upload successful: ' + (result.message || 'Image processed.'));
      console.log('Upload result:', result);

      if (result.latitude != null && result.longitude != null) {
        setLocation({ lat: result.latitude, lon: result.longitude });
      } else {
        setLocation(null); // No location data from backend
      }

      setSelectedFile(null); // Reset after successful upload
      setPreview(null);
      // Keep location and metadata set until a new file is selected
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message + '. See console for more details.');
    }
  };

  return (
    <div>
      <h2>Upload Your Photo</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <div>
          <h3>Preview:</h3>
          <img src={preview} alt="Selected preview" style={{ maxHeight: '200px', maxWidth: '200px', marginTop: '10px' }} />
        </div>
      )}
      <button onClick={handleSubmit} style={{ marginTop: '10px' }} disabled={!selectedFile}>
        Upload Image
      </button>
      {location && location.lat != null && location.lon != null && (
        <PhotoMap latitude={location.lat} longitude={location.lon} />
      )}
    </div>
  );
}

export default ImageUpload;
