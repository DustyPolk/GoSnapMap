import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet's CSS is imported

// Optional: Fix for default marker icon issue in some setups
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function PhotoMap({ latitude, longitude }) {
  if (latitude == null || longitude == null) {
    return <div>Location data not available for this photo.</div>;
  }

  const position = [latitude, longitude];

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '400px', width: '100%', marginTop: '20px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          Photo Location <br /> Lat: {latitude}, Lon: {longitude}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default PhotoMap;
