import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for better visibility
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map styles
const mapStyles = {
  standard: {
    name: 'Standard View',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Component to fix map size issues
function MapResizer() {
  const map = useMap();
  
  useEffect(() => {
    // Fix for map rendering issues
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
    
    // Also fix on window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
  
  return null;
}

function PhotoMap({ latitude, longitude }) {
  const [currentStyle, setCurrentStyle] = useState('standard');
  const mapContainerRef = useRef(null);
  
  if (latitude == null || longitude == null) {
    return <div>Location data not available for this photo.</div>;
  }

  const position = [latitude, longitude];
  const selectedStyle = mapStyles[currentStyle];

  return (
    <div className="photo-map-container" ref={mapContainerRef}>
      {/* Map Style Toggle Button */}
      <div className="map-style-selector" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
        <button 
          onClick={() => setCurrentStyle(currentStyle === 'satellite' ? 'standard' : 'satellite')}
          className="map-style-toggle"
          style={{
            backgroundColor: currentStyle === 'satellite' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
            color: currentStyle === 'satellite' ? 'white' : 'var(--primary-dark)',
            border: 'none',
            borderRadius: '30px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease'
          }}
        >
          {currentStyle === 'satellite' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"/>
              </svg>
              Standard View
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              </svg>
              Satellite View
            </>
          )}
        </button>
      </div>
      
      {/* Map Container */}
      <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
        <MapContainer 
          center={position} 
          zoom={14} 
          scrollWheelZoom={true} 
          style={{ 
            height: '100%', 
            width: '100%'
          }}
          zoomControl={false}
        >
          <TileLayer
            attribution={selectedStyle.attribution}
            url={selectedStyle.url}
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <div className="map-popup">
                <strong>Photo Location</strong>
                <p>Latitude: {latitude.toFixed(6)}</p>
                <p>Longitude: {longitude.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
          <ZoomControl position="bottomright" />
          <MapResizer />
        </MapContainer>
      </div>
    </div>
  );
}

export default PhotoMap;
