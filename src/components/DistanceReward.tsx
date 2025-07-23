import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Haversine formula to calculate distance between two lat/lon points in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fix default icon issue with Leaflet in React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const DistanceReward: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location.');
        setLoading(false);
      }
    );
  };

  // Geocode destination using OpenStreetMap Nominatim
  const geocodeDestination = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setDestCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        setError(null);
      } else {
        setError('Destination not found.');
        setDestCoords(null);
      }
    } catch (e) {
      setError('Error fetching destination coordinates.');
      setDestCoords(null);
    }
    setLoading(false);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDistance(null);
    setPoints(null);
    setError(null);
    if (!destination) {
      setError('Please enter a destination.');
      return;
    }
    if (!userCoords) {
      getUserLocation();
      return;
    }
    await geocodeDestination(destination);
  };

  // Calculate distance and points when both coordinates are available
  React.useEffect(() => {
    if (userCoords && destCoords) {
      const dist = haversineDistance(userCoords.lat, userCoords.lon, destCoords.lat, destCoords.lon);
      setDistance(dist);
      setPoints(Math.round(dist * 10));
    }
  }, [userCoords, destCoords]);

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Distance Reward Calculator</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter destination"
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }} disabled={loading}>
          Calculate Points
        </button>
      </form>
      <button onClick={getUserLocation} style={{ marginTop: 8, padding: '6px 12px' }} disabled={loading}>
        Get My Location
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {distance !== null && points !== null && !error && (
        <div style={{ marginTop: 16 }}>
          <p>Distance: {distance.toFixed(2)} km</p>
          <p>Points Earned: <b>{points}</b></p>
        </div>
      )}
      {/* Map integration */}
      {(userCoords || destCoords) && (
        <div style={{ height: 350, width: '100%', marginTop: 16 }}>
          <MapContainer
            center={userCoords ? [userCoords.lat, userCoords.lon] : destCoords ? [destCoords.lat, destCoords.lon] : [0, 0]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userCoords && (
              <Marker position={[userCoords.lat, userCoords.lon]}>
                <Popup>Your Location</Popup>
              </Marker>
            )}
            {destCoords && (
              <Marker position={[destCoords.lat, destCoords.lon]}>
                <Popup>Destination</Popup>
              </Marker>
            )}
            {userCoords && destCoords && (
              <Polyline positions={[[userCoords.lat, userCoords.lon], [destCoords.lat, destCoords.lon]]} color="blue" />
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default DistanceReward; 