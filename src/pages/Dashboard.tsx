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
import Header from "@/components/Header";
import {
  Upload,
  Camera,
  MapPin,
  Leaf,
  Trophy,
  Users,
  LogOut,
  User,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Zap,
  CheckCircle,
  Star,
  Sparkles
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

  // Circular progress component
  const CircularProgress = ({ value, max, label, color = "green", size = "lg" }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const sizeClasses = {
      sm: "w-20 h-20",
      md: "w-24 h-24",
      lg: "w-32 h-32",
      xl: "w-40 h-40"
    };

    const colorClasses = {
      green: "stroke-green-500",
      blue: "stroke-blue-500",
      purple: "stroke-purple-500",
      orange: "stroke-orange-500"
    };

    return (
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClasses[color]} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground font-medium">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50">
      <Header />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-24 h-24 bg-white/10 rounded-full blur-lg animate-bounce"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome back, {user?.email?.split('@')[0]}!</h1>
              <p className="text-green-100 text-xl">Ready to make another positive impact today?</p>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{userProfile?.points || 0}</div>
                  <div className="text-green-100 text-sm">Total Points</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{userProfile?.total_carbon_saved || 0}kg</div>
                  <div className="text-green-100 text-sm">CO₂ Saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <Card className="card-eco">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-green-600" />
                  Your Impact Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <CircularProgress
                      value={userProfile?.points || 0}
                      max={1000}
                      label="Points"
                      color="green"
                      size="lg"
                    />
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground">Monthly Goal: 1,000 points</div>
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        <Trophy className="h-3 w-3 mr-1" />
                        {Math.round(((userProfile?.points || 0) / 1000) * 100)}% Complete
                      </Badge>
                    </div>
                  </div>

                  <div className="text-center">
                    <CircularProgress
                      value={userProfile?.total_carbon_saved || 0}
                      max={50}
                      label="CO₂ kg"
                      color="blue"
                      size="lg"
                    />
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground">Monthly Goal: 50kg CO₂</div>
                      <Badge className="mt-2 bg-blue-100 text-blue-800">
                        <Leaf className="h-3 w-3 mr-1" />
                        {Math.round(((userProfile?.total_carbon_saved || 0) / 50) * 100)}% Complete
                      </Badge>
                    </div>
                  </div>

                  <div className="text-center">
                    <CircularProgress
                      value={trips.length}
                      max={20}
                      label="Trips"
                      color="purple"
                      size="lg"
                    />
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground">Monthly Goal: 20 trips</div>
                      <Badge className="mt-2 bg-purple-100 text-purple-800">
                        <MapPin className="h-3 w-3 mr-1" />
                        {Math.round((trips.length / 20) * 100)}% Complete
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    Recent Achievements
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(userProfile?.points || 0) >= 100 && (
                      <Badge className="bg-yellow-100 text-yellow-800 px-3 py-2">
                        <Star className="h-4 w-4 mr-1" />
                        First 100 Points
                      </Badge>
                    )}
                    {trips.length >= 5 && (
                      <Badge className="bg-green-100 text-green-800 px-3 py-2">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        5 Green Trips
                      </Badge>
                    )}
                    {(userProfile?.total_carbon_saved || 0) >= 10 && (
                      <Badge className="bg-blue-100 text-blue-800 px-3 py-2">
                        <Leaf className="h-4 w-4 mr-1" />
                        Eco Warrior
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Recording */}
            <Card className="card-eco">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-green-600" />
                  Record Your Green Journey
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Upload your sustainable transport ticket and earn rewards!
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trip Form Steps */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        tripData.startLocation ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        1
                      </div>
                      <span className="ml-2 text-sm font-medium">Locations</span>
                    </div>
                    <div className={`w-8 h-1 rounded ${
                      tripData.startLocation && tripData.endLocation ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        tripData.ticketImage ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        2
                      </div>
                      <span className="ml-2 text-sm font-medium">Upload Ticket</span>
                    </div>
                    <div className={`w-8 h-1 rounded ${
                      tripData.startLocation && tripData.endLocation && tripData.ticketImage ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <span className="ml-2 text-sm font-medium">Submit</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startLocation" className="text-base font-semibold flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-green-600" />
                      Start Location
                    </Label>
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
                    <Label htmlFor="endLocation" className="text-base font-semibold flex items-center">
                      <Target className="h-4 w-4 mr-2 text-blue-600" />
                      End Location
                    </Label>
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
                  <Label className="text-base font-semibold flex items-center">
                    <Camera className="h-4 w-4 mr-2 text-purple-600" />
                    Ticket Image
                  </Label>
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
                  className="w-full btn-eco text-lg py-6 rounded-2xl"
                >
                  {loading ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                      Recording Trip...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Record Green Trip
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Trips */}
            <Card className="card-eco">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-blue-600" />
                  Recent Green Journeys
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Your latest sustainable transport adventures
                </p>
              </CardHeader>
              <CardContent>
                {trips.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <MapPin className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No trips yet!</h3>
                    <p className="text-muted-foreground mb-6">
                      Upload your first sustainable transport ticket to get started on your eco-journey.
                    </p>
                    <Button className="btn-eco" onClick={() => document.querySelector('input[type="file"]')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trips.map((trip, index) => (
                      <div key={trip.id} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-white to-green-50/30 p-6 hover:shadow-lg transition-all duration-300">
                        {/* Trip number badge */}
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-100 text-green-800">
                            Trip #{trips.length - index}
                          </Badge>
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                              <span className="font-semibold text-foreground">{trip.start_location}</span>
                            </div>
                            <div className="flex items-center mb-4 ml-6">
                              <div className="w-px h-8 bg-gradient-to-b from-green-500 to-blue-500 mr-3"></div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                              <span className="font-semibold text-foreground">{trip.end_location}</span>
                            </div>

                            <div className="flex items-center mt-4 space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(trip.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="text-right ml-6">
                            <div className="flex items-center justify-end mb-2">
                              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                              <span className="text-2xl font-bold text-green-600">+{trip.points_earned}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">points earned</div>

                            <div className="flex items-center justify-end">
                              <Leaf className="h-4 w-4 mr-2 text-green-500" />
                              <span className="font-semibold text-green-600">{trip.carbon_saved}kg CO₂</span>
                            </div>
                            <div className="text-xs text-muted-foreground">carbon saved</div>
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
          <div className="space-y-8">
            {/* Quick Stats */}
            <Card className="card-eco">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{userProfile?.points || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                    <Leaf className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-green-800">{userProfile?.total_carbon_saved || 0}kg</div>
                    <div className="text-xs text-green-600">CO₂ Saved</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl">
                    <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-blue-800">{trips.length}</div>
                    <div className="text-xs text-blue-600">Green Trips</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Goals */}
            <Card className="card-eco">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-500" />
                  Monthly Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      Points Goal
                    </span>
                    <span className="text-sm font-bold">{userProfile?.points || 0}/1000</span>
                  </div>
                  <div className="relative">
                    <Progress value={(userProfile?.points || 0) / 10} className="h-3 rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20"></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(((userProfile?.points || 0) / 1000) * 100)}% complete
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-green-500" />
                      CO₂ Goal
                    </span>
                    <span className="text-sm font-bold">{userProfile?.total_carbon_saved || 0}/50kg</span>
                  </div>
                  <div className="relative">
                    <Progress value={(userProfile?.total_carbon_saved || 0) * 2} className="h-3 rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20"></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(((userProfile?.total_carbon_saved || 0) / 50) * 100)}% complete
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      Trip Goal
                    </span>
                    <span className="text-sm font-bold">{trips.length}/20</span>
                  </div>
                  <div className="relative">
                    <Progress value={(trips.length / 20) * 100} className="h-3 rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-20"></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((trips.length / 20) * 100)}% complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="card-eco">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-500" />
                  Top Eco Warriors
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  See how you rank among green champions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((boardUser, index) => {
                    const isCurrentUser = boardUser.email === user?.email;
                    const position = index + 1;

                    return (
                      <div key={boardUser.email} className={`relative rounded-xl p-4 transition-all duration-300 ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              position === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                              position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                              position === 3 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' :
                              'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                            }`}>
                              {position <= 3 && (
                                <div className="absolute -top-1 -right-1">
                                  {position === 1 && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                                  {position === 2 && <Award className="h-4 w-4 text-gray-300 fill-current" />}
                                  {position === 3 && <Trophy className="h-4 w-4 text-orange-400 fill-current" />}
                                </div>
                              )}
                              #{position}
                            </div>
                            <div>
                              <div className={`font-semibold ${
                                isCurrentUser ? 'text-green-800' : 'text-foreground'
                              }`}>
                                {boardUser.email.split('@')[0]}
                                {isCurrentUser && <span className="ml-2 text-xs">(You!)</span>}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Leaf className="h-3 w-3 mr-1 text-green-500" />
                                {boardUser.total_carbon_saved}kg CO₂ saved
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${
                              isCurrentUser ? 'text-green-700' : 'text-green-600'
                            }`}>
                              {boardUser.points}
                            </div>
                            <div className="text-xs text-muted-foreground">points</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
