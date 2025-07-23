import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Camera, 
  MapPin, 
  Leaf, 
  Trophy, 
  Users,
  LogOut,
  User
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface UserProfile {
  points: number;
  total_carbon_saved: number;
}

interface Trip {
  id: string;
  start_location: string;
  end_location: string;
  carbon_saved: number;
  points_earned: number;
  created_at: string;
}

interface LeaderboardUser {
  email: string;
  points: number;
  total_carbon_saved: number;
}

// Add Mapbox autocomplete utility
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;

async function fetchPlaceSuggestions(query: string) {
  if (!query) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&autocomplete=true&limit=5`;
  const res = await fetch(url);
  const data = await res.json();
  return data.features || [];
}

async function reverseGeocode(lat: number, lon: number) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.features?.[0]?.place_name || `${lat},${lon}`;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const [tripData, setTripData] = useState({
    startLocation: "",
    endLocation: "",
    ticketImage: null as File | null
  });

  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<any[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showDistancePopout, setShowDistancePopout] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [showMapModal, setShowMapModal] = useState(false);
  const [pendingTrip, setPendingTrip] = useState<null | {
    startLocation: string;
    endLocation: string;
    startCoords: [number, number];
    endCoords: [number, number];
    distance: number;
    ticketImage: File;
  }>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchTrips();
      fetchLeaderboard();
    }
  }, [user]);

  // Haversine formula
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Get coordinates from Mapbox feature
  function getCoordsFromPlace(place: any): [number, number] {
    return place?.center ? [place.center[1], place.center[0]] : null;
  }

  // Update coordinates and distance when locations change
  useEffect(() => {
    const fetchCoords = async () => {
      if (tripData.startLocation && tripData.endLocation) {
        // Geocode start
        const startRes = await fetchPlaceSuggestions(tripData.startLocation);
        const endRes = await fetchPlaceSuggestions(tripData.endLocation);
        const start = startRes[0];
        const end = endRes[0];
        if (start && end) {
          const sCoords = getCoordsFromPlace(start);
          const eCoords = getCoordsFromPlace(end);
          setStartCoords(sCoords);
          setEndCoords(eCoords);
          if (sCoords && eCoords) {
            const dist = haversineDistance(sCoords[0], sCoords[1], eCoords[0], eCoords[1]);
            setDistance(dist);
            setShowDistancePopout(true);
          } else {
            setDistance(null);
            setShowDistancePopout(false);
          }
        } else {
          setStartCoords(null);
          setEndCoords(null);
          setDistance(null);
          setShowDistancePopout(false);
        }
      } else {
        setStartCoords(null);
        setEndCoords(null);
        setDistance(null);
        setShowDistancePopout(false);
      }
    };
    fetchCoords();
  }, [tripData.startLocation, tripData.endLocation]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('points, total_carbon_saved')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, points, total_carbon_saved')
        .order('points', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTripData(prev => ({ ...prev, ticketImage: file }));
    }
  };

  const capturePhoto = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraFacingMode } });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setTimeout(async () => {
        if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], 'ticket-photo.jpg', { type: 'image/jpeg' });
                setTripData(prev => ({ ...prev, ticketImage: file }));
              }
            }, 'image/jpeg');
          }
        }
        
        stream.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
      }, 3000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try uploading a file instead.",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const uploadTicketImage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ticket-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      return fileName;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const calculateCarbonSaved = (startLocation: string, endLocation: string): number => {
    // Simplified calculation - in real app, you'd use a mapping service
    const baseDistance = Math.random() * 20 + 5; // 5-25 km
    const carbonSavedPerKm = 0.12; // kg CO2 saved per km vs car
    return Math.round(baseDistance * carbonSavedPerKm * 100) / 100;
  };

  const handleSubmitTrip = async () => {
    if (!tripData.startLocation || !tripData.endLocation || !tripData.ticketImage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and upload a ticket image.",
        variant: "destructive",
      });
      return;
    }

    // Get coordinates and distance
    const startRes = await fetchPlaceSuggestions(tripData.startLocation);
    const endRes = await fetchPlaceSuggestions(tripData.endLocation);
    const start = startRes[0];
    const end = endRes[0];
    if (!start || !end) {
      toast({
        title: "Invalid Locations",
        description: "Please select valid start and end locations.",
        variant: "destructive",
      });
      return;
    }
    const sCoords = getCoordsFromPlace(start);
    const eCoords = getCoordsFromPlace(end);
    if (!sCoords || !eCoords) {
      toast({
        title: "Location Error",
        description: "Could not determine coordinates for locations.",
        variant: "destructive",
      });
      return;
    }
    const dist = haversineDistance(sCoords[0], sCoords[1], eCoords[0], eCoords[1]);

    // Show map modal with animation before saving
    setPendingTrip({
      startLocation: tripData.startLocation,
      endLocation: tripData.endLocation,
      startCoords: sCoords,
      endCoords: eCoords,
      distance: dist,
      ticketImage: tripData.ticketImage!,
    });
    setShowMapModal(true);
  };

  // New function to actually save the trip after animation
  const savePendingTrip = async () => {
    if (!pendingTrip) return;
    setLoading(true);
    try {
      // Upload image
      const imagePath = await uploadTicketImage(pendingTrip.ticketImage);
      if (!imagePath) throw new Error('Failed to upload image');

      // Calculate carbon saved and points
      const carbonSaved = Math.round(pendingTrip.distance * 0.12 * 100) / 100; // 0.12 kg/km
      const pointsEarned = Math.round(pendingTrip.distance * 10); // 10 points/km

      // Insert trip
      const { error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user?.id,
          start_location: pendingTrip.startLocation,
          end_location: pendingTrip.endLocation,
          carbon_saved: carbonSaved,
          points_earned: pointsEarned,
          image_path: imagePath
        });
      if (tripError) throw tripError;

      // Update user profile
      if (userProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            points: userProfile.points + pointsEarned,
            total_carbon_saved: userProfile.total_carbon_saved + carbonSaved
          })
          .eq('user_id', user?.id);
        if (profileError) throw profileError;
      }

      toast({
        title: "Trip Recorded!",
        description: `You earned ${pointsEarned} points and saved ${carbonSaved}kg CO₂!`,
      });

      // Reset form and refresh data
      setTripData({ startLocation: "", endLocation: "", ticketImage: null });
      setPendingTrip(null);
      setShowMapModal(false);
      fetchUserProfile();
      fetchTrips();
      fetchLeaderboard();
    } catch (error) {
      console.error('Error submitting trip:', error);
      toast({
        title: "Error",
        description: "Failed to record trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Go Green Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                    Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile?.points || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Leaf className="h-4 w-4 mr-2 text-green-500" />
                    CO₂ Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile?.total_carbon_saved || 0}kg
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    Trips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {trips.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ticket Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Record Your Trip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startLocation">Start Location</Label>
                    <div style={{ position: 'relative' }}>
                      <Input
                        id="startLocation"
                        value={tripData.startLocation}
                        onChange={async (e) => {
                          const value = e.target.value;
                          setTripData(prev => ({ ...prev, startLocation: value }));
                          if (value.length > 1) {
                            const suggestions = await fetchPlaceSuggestions(value);
                            setStartSuggestions(suggestions);
                            setShowStartSuggestions(true);
                          } else {
                            setStartSuggestions([]);
                            setShowStartSuggestions(false);
                          }
                        }}
                        placeholder="Enter start location"
                        autoComplete="off"
                        onFocus={async (e) => {
                          if (tripData.startLocation.length > 1) {
                            const suggestions = await fetchPlaceSuggestions(tripData.startLocation);
                            setStartSuggestions(suggestions);
                            setShowStartSuggestions(true);
                          }
                        }}
                        onBlur={() => setTimeout(() => setShowStartSuggestions(false), 200)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        style={{ position: 'absolute', right: 0, top: 0, height: '100%' }}
                        variant="outline"
                        onClick={async () => {
                          if (!navigator.geolocation) return;
                          navigator.geolocation.getCurrentPosition(async (pos) => {
                            const place = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                            setTripData(prev => ({ ...prev, startLocation: place }));
                          });
                        }}
                      >
                        Get My Location
                      </Button>
                      {showStartSuggestions && startSuggestions.length > 0 && (
                        <div style={{ position: 'absolute', zIndex: 10, background: 'white', border: '1px solid #ccc', width: '100%' }}>
                          {startSuggestions.map((s: any) => (
                            <div
                              key={s.id}
                              style={{ padding: 8, cursor: 'pointer' }}
                              onMouseDown={() => {
                                setTripData(prev => ({ ...prev, startLocation: s.place_name }));
                                setShowStartSuggestions(false);
                              }}
                            >
                              {s.place_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endLocation">End Location</Label>
                    <div style={{ position: 'relative' }}>
                      <Input
                        id="endLocation"
                        value={tripData.endLocation}
                        onChange={async (e) => {
                          const value = e.target.value;
                          setTripData(prev => ({ ...prev, endLocation: value }));
                          if (value.length > 1) {
                            const suggestions = await fetchPlaceSuggestions(value);
                            setEndSuggestions(suggestions);
                            setShowEndSuggestions(true);
                          } else {
                            setEndSuggestions([]);
                            setShowEndSuggestions(false);
                          }
                        }}
                        placeholder="Enter end location"
                        autoComplete="off"
                        onFocus={async (e) => {
                          if (tripData.endLocation.length > 1) {
                            const suggestions = await fetchPlaceSuggestions(tripData.endLocation);
                            setEndSuggestions(suggestions);
                            setShowEndSuggestions(true);
                          }
                        }}
                        onBlur={() => setTimeout(() => setShowEndSuggestions(false), 200)}
                      />
                      {showEndSuggestions && endSuggestions.length > 0 && (
                        <div style={{ position: 'absolute', zIndex: 10, background: 'white', border: '1px solid #ccc', width: '100%' }}>
                          {endSuggestions.map((s: any) => (
                            <div
                              key={s.id}
                              style={{ padding: 8, cursor: 'pointer' }}
                              onMouseDown={() => {
                                setTripData(prev => ({ ...prev, endLocation: s.place_name }));
                                setShowEndSuggestions(false);
                              }}
                            >
                              {s.place_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {startCoords && endCoords && !showMapModal && (
                  <Button
                    type="button"
                    variant="outline"
                    style={{ margin: '1rem 0' }}
                    onClick={handleSubmitTrip}
                  >
                    Show Route Map
                  </Button>
                )}

                <div>
                  <Label>Ticket Image</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={capturePhoto}
                        disabled={isCapturing}
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isCapturing ? "Capturing..." : "Take Photo"}
                      </Button>
                      {('mediaDevices' in navigator) && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCameraFacingMode(f => f === 'environment' ? 'user' : 'environment')}
                          className="flex-1"
                        >
                          Flip Camera
                        </Button>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {isCapturing && (
                      <video
                        ref={videoRef}
                        className="w-full max-w-md rounded-lg"
                        autoPlay
                        playsInline
                      />
                    )}
                    
                    {tripData.ticketImage && (
                      <p className="text-sm text-green-600">
                        ✓ Image selected: {tripData.ticketImage.name}
                      </p>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleSubmitTrip} 
                  disabled={loading || !tripData.startLocation || !tripData.endLocation || !tripData.ticketImage}
                  className="w-full"
                >
                  {loading ? "Recording Trip..." : "Record Trip"}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Trips */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
              </CardHeader>
              <CardContent>
                {trips.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No trips recorded yet. Upload your first ticket to get started!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {trips.map((trip) => (
                      <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {trip.start_location} → {trip.end_location}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(trip.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            +{trip.points_earned} points
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {trip.carbon_saved}kg CO₂ saved
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Points Goal</span>
                      <span>{userProfile?.points || 0}/1000</span>
                    </div>
                    <Progress value={(userProfile?.points || 0) / 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CO₂ Goal</span>
                      <span>{userProfile?.total_carbon_saved || 0}/50kg</span>
                    </div>
                    <Progress value={(userProfile?.total_carbon_saved || 0) * 2} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div key={user.email} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">
                            {user.email.split('@')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.total_carbon_saved}kg CO₂
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-green-600">
                        {user.points}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Map modal overlay: */}
      {showMapModal && ((pendingTrip && pendingTrip.startCoords && pendingTrip.endCoords) || (startCoords && endCoords)) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ position: 'relative', background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', padding: 24, minWidth: 350, maxWidth: 600 }}>
            <button
              onClick={() => { setShowMapModal(false); setPendingTrip(null); }}
              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888' }}
              aria-label="Close map"
            >
              ×
            </button>
            <MapContainer
              center={((pendingTrip?.startCoords || startCoords || [0, 0]) as LatLngExpression)}
              zoom={13}
              style={{ height: 250, width: '100%', borderRadius: 12 }}
              scrollWheelZoom={false}
              dragging={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={pendingTrip?.startCoords || startCoords}>
                <Popup>Start</Popup>
              </Marker>
              <Marker position={pendingTrip?.endCoords || endCoords}>
                <Popup>End</Popup>
              </Marker>
              <Polyline positions={[(pendingTrip?.startCoords || startCoords), (pendingTrip?.endCoords || endCoords)]} pathOptions={{ color: 'blue' }} />
            </MapContainer>
            {/* Animated popout for distance */}
            {showDistancePopout && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 20,
                transform: 'translateX(-50%) scale(1)',
                background: 'white',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                padding: '1rem 2rem',
                zIndex: 1000,
                transition: 'all 0.5s cubic-bezier(.68,-0.55,.27,1.55)',
                animation: 'popout 0.7s cubic-bezier(.68,-0.55,.27,1.55)'
              }}>
                <span style={{ fontWeight: 600, fontSize: 20 }}>Distance: {(pendingTrip?.distance || distance)?.toFixed(2)} km</span>
              </div>
            )}
            <style>{`
              @keyframes popout {
                0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
                60% { transform: translateX(-50%) scale(1.1); opacity: 1; }
                100% { transform: translateX(-50%) scale(1); opacity: 1; }
              }
            `}</style>
            {pendingTrip && (
              <Button
                type="button"
                className="w-full mt-4"
                onClick={savePendingTrip}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Trip"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;