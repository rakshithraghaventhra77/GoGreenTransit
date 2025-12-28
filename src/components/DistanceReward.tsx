import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Calculator, Leaf, Trophy, Zap, Target } from 'lucide-react';
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
  const [showResults, setShowResults] = useState(false);

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
    setShowResults(false);
    
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
      setShowResults(true);
    }
  }, [userCoords, destCoords]);

  const carbonSaved = distance ? (distance * 0.12).toFixed(2) : 0;
  const treesPlanted = distance ? Math.floor(distance * 0.12 / 22) : 0;

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-eco mb-6">
              Distance Reward Calculator
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover how many points you can earn and how much CO₂ you can save by choosing sustainable transport options.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Calculator Form */}
            <Card className="card-eco">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Calculator className="h-6 w-6 mr-3 text-green-600" />
                  Plan Your Green Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="destination" className="text-base font-semibold flex items-center mb-3">
                        <Target className="h-4 w-4 mr-2 text-blue-600" />
                        Destination
                      </Label>
                      <Input
                        id="destination"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Enter your destination (e.g., Times Square, New York)"
                        className="text-base py-3 rounded-xl"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="btn-eco flex-1 py-4 text-base rounded-xl"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Calculate Rewards
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button"
                        onClick={getUserLocation} 
                        disabled={loading}
                        variant="outline"
                        className="px-6 py-4 rounded-xl hover:bg-green-50"
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {userCoords && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-700 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Your location detected successfully!
                    </p>
                  </div>
                )}

                {showResults && distance !== null && points !== null && (
                  <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl border border-green-200">
                      <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                        <Trophy className="h-5 w-5 mr-2" />
                        Your Green Journey Rewards
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white/50 rounded-xl">
                          <div className="text-2xl font-bold text-green-700">{distance.toFixed(1)} km</div>
                          <div className="text-sm text-green-600">Distance</div>
                        </div>
                        <div className="text-center p-4 bg-white/50 rounded-xl">
                          <div className="text-2xl font-bold text-blue-700">{points}</div>
                          <div className="text-sm text-blue-600">Points Earned</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                          <span className="flex items-center text-sm font-medium text-gray-700">
                            <Leaf className="h-4 w-4 mr-2 text-green-500" />
                            CO₂ Saved
                          </span>
                          <span className="font-bold text-green-600">{carbonSaved} kg</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                          <span className="flex items-center text-sm font-medium text-gray-700">
                            🌳 Trees Equivalent
                          </span>
                          <span className="font-bold text-green-600">{treesPlanted} trees</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                          <span className="flex items-center text-sm font-medium text-gray-700">
                            💰 Environmental Value
                          </span>
                          <span className="font-bold text-green-600">${(parseFloat(carbonSaved) * 2.5).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge className="bg-green-500 text-white">🌱 Eco-Friendly</Badge>
                        <Badge className="bg-blue-500 text-white">🚇 Sustainable Transport</Badge>
                        {distance > 10 && <Badge className="bg-yellow-500 text-white">🏆 Long Distance</Badge>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive Map */}
            <Card className="card-eco">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <MapPin className="h-6 w-6 mr-3 text-blue-600" />
                  Route Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(userCoords || destCoords) ? (
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
                    <MapContainer
                      center={userCoords ? [userCoords.lat, userCoords.lon] : destCoords ? [destCoords.lat, destCoords.lon] : [0, 0]}
                      zoom={13}
                      style={{ height: 400, width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {userCoords && (
                        <Marker position={[userCoords.lat, userCoords.lon]}>
                          <Popup>
                            <div className="text-center">
                              <div className="font-semibold text-green-700">Your Location</div>
                              <div className="text-sm text-gray-600">Journey starts here</div>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      {destCoords && (
                        <Marker position={[destCoords.lat, destCoords.lon]}>
                          <Popup>
                            <div className="text-center">
                              <div className="font-semibold text-blue-700">Destination</div>
                              <div className="text-sm text-gray-600">{destination}</div>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      {userCoords && destCoords && (
                        <Polyline 
                          positions={[[userCoords.lat, userCoords.lon], [destCoords.lat, destCoords.lon]]} 
                          pathOptions={{ color: '#10b981', weight: 4, opacity: 0.8 }} 
                        />
                      )}
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                        <MapPin className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Start Your Journey</h3>
                        <p className="text-gray-500 text-sm max-w-xs">
                          Enter your destination and get your location to see the route on the map
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="card-eco text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Earn Points</h3>
                <p className="text-muted-foreground text-sm">Get 10 points for every kilometer you travel sustainably</p>
              </CardContent>
            </Card>

            <Card className="card-eco text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Save CO₂</h3>
                <p className="text-muted-foreground text-sm">Reduce 0.12kg CO₂ emissions per kilometer compared to driving</p>
              </CardContent>
            </Card>

            <Card className="card-eco text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Make Impact</h3>
                <p className="text-muted-foreground text-sm">Every journey contributes to a cleaner, greener future</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DistanceReward;
