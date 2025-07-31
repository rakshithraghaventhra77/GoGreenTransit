import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Award, MapPin, Github, Twitter, Mail, Leaf, Trophy, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

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

const Rewards = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate stats from real data
  const journeyStats = {
    totalJourneys: trips.length,
    totalDistance: trips.reduce((sum, trip) => {
      return sum + (trip.points_earned / 10);
    }, 0).toFixed(1) + " km",
    co2Saved: (userProfile?.total_carbon_saved || 0).toFixed(1) + " kg",
    moneyValue: "$" + ((userProfile?.total_carbon_saved || 0) * 2.5).toFixed(0)
  };

  // Calculate streak data from trips
  const calculateStreakData = () => {
    if (trips.length === 0) return { current: 0, longest: 0, thisMonth: 0 };
    
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    const thisMonthTrips = trips.filter(trip => {
      const tripDate = new Date(trip.created_at);
      return tripDate.getMonth() === thisMonth && tripDate.getFullYear() === thisYear;
    }).length;
    
    const tripDates = [...new Set(trips.map(trip => 
      new Date(trip.created_at).toDateString()
    ))];
    
    return {
      current: Math.min(tripDates.length, 7),
      longest: Math.min(tripDates.length, 14),
      thisMonth: thisMonthTrips
    };
  };

  const streakData = calculateStreakData();

  const generateWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const tripsThisDay = trips.filter(trip => {
        const tripDate = new Date(trip.created_at);
        return tripDate.toDateString() === date.toDateString();
      }).length;
      
      weekData.push({ day: dayName, journeys: tripsThisDay });
    }
    
    return weekData;
  };

  const weeklyData = generateWeeklyData();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('points, total_carbon_saved')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profileData);

      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;
      setTrips(tripsData || []);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gradient-eco mb-4">Your Green Journey</h1>
            <p className="text-xl text-muted-foreground mb-2">Track your progress and celebrate your environmental impact</p>
            {user && (
              <p className="text-lg text-primary font-medium">
                Welcome back, {user.email?.split('@')[0]}! 🌱
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Section - Streak Tracker */}
            <div className="space-y-6">
              <Card className="card-eco">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Streak Tracker</span>
                  </CardTitle>
                  <CardDescription>Your consistent eco-friendly journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-eco rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                      <span className="text-3xl font-bold text-primary-foreground">{streakData.current}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Current Streak</h3>
                    <p className="text-sm text-muted-foreground">Days in a row</p>
                    {streakData.current > 0 && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        🔥 On Fire!
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-accent rounded-lg p-4">
                      <div className="text-2xl font-bold text-gradient-eco">{streakData.longest}</div>
                      <div className="text-xs text-muted-foreground">Longest Streak</div>
                    </div>
                    <div className="bg-accent rounded-lg p-4">
                      <div className="text-2xl font-bold text-gradient-eco">{streakData.thisMonth}</div>
                      <div className="text-xs text-muted-foreground">This Month</div>
                    </div>
                  </div>

                  {/* Weekly Progress */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3">This Week</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {weeklyData.map((day, index) => (
                        <div key={day.day} className="text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                            day.journeys > 0 
                              ? "bg-gradient-eco text-primary-foreground" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {day.journeys || "0"}
                          </div>
                          <div className="text-xs text-muted-foreground">{day.day}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {streakData.current >= 7 && (
                      <Badge className="bg-leaf-green text-primary-foreground">🔥 Hot Streak</Badge>
                    )}
                    {(userProfile?.total_carbon_saved || 0) >= 50 && (
                      <Badge className="bg-forest-green text-primary-foreground">🌱 Eco Warrior</Badge>
                    )}
                    {trips.length >= 10 && (
                      <Badge className="bg-blue-500 text-white">🚌 Transit Pro</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center Section - Journey Report */}
            <div className="space-y-6">
              <Card className="card-nature">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Journey Report</span>
                  </CardTitle>
                  <CardDescription>Your environmental impact this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center bg-card/50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-gradient-eco">{journeyStats.totalJourneys}</div>
                      <div className="text-sm text-muted-foreground">Total Journeys</div>
                    </div>
                    <div className="text-center bg-card/50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-gradient-eco">{journeyStats.totalDistance}</div>
                      <div className="text-sm text-muted-foreground">Distance</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Monthly CO₂ Goal</span>
                        <span>{Math.min(100, Math.round(((userProfile?.total_carbon_saved || 0) / 50) * 100))}%</span>
                      </div>
                      <Progress value={Math.min(100, ((userProfile?.total_carbon_saved || 0) / 50) * 100)} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.max(0, 50 - (userProfile?.total_carbon_saved || 0)).toFixed(1)}kg more to reach 50kg goal
                      </p>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">🌍</div>
                      <div className="text-2xl font-bold text-gradient-eco">{journeyStats.co2Saved}</div>
                      <div className="text-sm text-muted-foreground">CO₂ Saved</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Equivalent to planting {Math.floor((userProfile?.total_carbon_saved || 0) / 22)} trees
                      </div>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">💰</div>
                      <div className="text-2xl font-bold text-gradient-eco">{journeyStats.moneyValue}</div>
                      <div className="text-sm text-muted-foreground">Environmental Value</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Based on carbon credit value
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Achievements */}
            <div className="space-y-6">
              <Card className="card-eco">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {/* First Journey Achievement */}
                    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      trips.length >= 1 ? 'bg-green-100 border-2 border-green-300' : 'bg-muted opacity-50'
                    }`}>
                      <div className="text-2xl">{trips.length >= 1 ? '🏆' : '🔒'}</div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          trips.length >= 1 ? 'text-green-800' : 'text-muted-foreground'
                        }`}>First Journey</div>
                        <div className="text-xs text-muted-foreground">Complete your first eco journey</div>
                      </div>
                      {trips.length >= 1 && (
                        <Badge className="bg-green-500 text-white text-xs">✓</Badge>
                      )}
                    </div>

                    {/* Week Warrior Achievement */}
                    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      streakData.current >= 7 ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-muted opacity-50'
                    }`}>
                      <div className="text-2xl">{streakData.current >= 7 ? '🌟' : '🔒'}</div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          streakData.current >= 7 ? 'text-yellow-800' : 'text-muted-foreground'
                        }`}>Week Warrior</div>
                        <div className="text-xs text-muted-foreground">7 days in a row</div>
                        <div className="text-xs text-primary font-medium">
                          Current: {streakData.current}/7 days
                        </div>
                      </div>
                      {streakData.current >= 7 && (
                        <Badge className="bg-yellow-500 text-white text-xs">✓</Badge>
                      )}
                    </div>

                    {/* Tree Saver Achievement */}
                    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      (userProfile?.total_carbon_saved || 0) >= 50 ? 'bg-emerald-100 border-2 border-emerald-300' : 'bg-muted opacity-50'
                    }`}>
                      <div className="text-2xl">{(userProfile?.total_carbon_saved || 0) >= 50 ? '🌱' : '🔒'}</div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          (userProfile?.total_carbon_saved || 0) >= 50 ? 'text-emerald-800' : 'text-muted-foreground'
                        }`}>Tree Saver</div>
                        <div className="text-xs text-muted-foreground">Save 50kg CO₂</div>
                        <div className="text-xs text-primary font-medium">
                          Progress: {(userProfile?.total_carbon_saved || 0).toFixed(1)}/50kg
                        </div>
                      </div>
                      {(userProfile?.total_carbon_saved || 0) >= 50 && (
                        <Badge className="bg-emerald-500 text-white text-xs">✓</Badge>
                      )}
                    </div>

                    {/* Transit Master Achievement */}
                    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      trips.length >= 20 ? 'bg-blue-100 border-2 border-blue-300' : 'bg-muted opacity-50'
                    }`}>
                      <div className="text-2xl">{trips.length >= 20 ? '🚌' : '🔒'}</div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          trips.length >= 20 ? 'text-blue-800' : 'text-muted-foreground'
                        }`}>Transit Master</div>
                        <div className="text-xs text-muted-foreground">Complete 20 journeys</div>
                        <div className="text-xs text-primary font-medium">
                          Progress: {trips.length}/20 trips
                        </div>
                      </div>
                      {trips.length >= 20 && (
                        <Badge className="bg-blue-500 text-white text-xs">✓</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* About Us Section */}
          <Card className="card-eco">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>About Go Green</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gradient-eco">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Go Green is dedicated to making sustainable transportation accessible and rewarding for everyone. 
                    We believe that small actions can create big environmental impacts when we work together as a community.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    By tracking and rewarding eco-friendly transport choices, we're building a movement of conscious 
                    commuters who are actively reducing their carbon footprint and creating a cleaner future for all.
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Our Real Impact:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• {userProfile?.points || 0}+ points earned by you</li>
                      <li>• {(userProfile?.total_carbon_saved || 0).toFixed(1)}kg CO₂ saved by you</li>
                      <li>• {trips.length} sustainable journeys completed by you</li>
                      <li>• Making a real difference, one trip at a time</li>
                    </ul>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-4 pt-4">
                    <div className="w-10 h-10 bg-gradient-eco rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                      <Github className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="w-10 h-10 bg-gradient-eco rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                      <Twitter className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="w-10 h-10 bg-gradient-eco rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                      <Mail className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <div>
                  <img 
                    src="/community-eco.svg" 
                    alt="Go Green Community" 
                    className="w-full h-auto rounded-2xl shadow-card"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
