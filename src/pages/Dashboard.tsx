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

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchTrips();
      fetchLeaderboard();
    }
  }, [user]);

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
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

    setLoading(true);
    
    try {
      // Upload image
      const imagePath = await uploadTicketImage(tripData.ticketImage);
      if (!imagePath) throw new Error('Failed to upload image');

      // Calculate carbon saved and points
      const carbonSaved = calculateCarbonSaved(tripData.startLocation, tripData.endLocation);
      const pointsEarned = Math.round(carbonSaved * 10); // 10 points per kg CO2 saved

      // Insert trip
      const { error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user?.id,
          start_location: tripData.startLocation,
          end_location: tripData.endLocation,
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
                    <Input
                      id="startLocation"
                      value={tripData.startLocation}
                      onChange={(e) => setTripData(prev => ({ ...prev, startLocation: e.target.value }))}
                      placeholder="Enter start location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endLocation">End Location</Label>
                    <Input
                      id="endLocation"
                      value={tripData.endLocation}
                      onChange={(e) => setTripData(prev => ({ ...prev, endLocation: e.target.value }))}
                      placeholder="Enter end location"
                    />
                  </div>
                </div>

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
    </div>
  );
};

export default Dashboard;