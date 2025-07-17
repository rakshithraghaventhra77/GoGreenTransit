import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Award, MapPin, Github, Twitter, Mail } from "lucide-react";
import Header from "@/components/Header";
import communityEco from "@/assets/community-eco.png";

const Rewards = () => {
  const streakData = {
    current: 12,
    longest: 28,
    thisMonth: 18
  };

  const journeyStats = {
    totalJourneys: 42,
    totalDistance: "324 km",
    co2Saved: "105 kg",
    moneyValue: "$145"
  };

  const weeklyData = [
    { day: "Mon", journeys: 2 },
    { day: "Tue", journeys: 1 },
    { day: "Wed", journeys: 3 },
    { day: "Thu", journeys: 2 },
    { day: "Fri", journeys: 1 },
    { day: "Sat", journeys: 0 },
    { day: "Sun", journeys: 1 }
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-eco mb-2">Your Green Journey</h1>
            <p className="text-muted-foreground">Track your progress and celebrate your environmental impact</p>
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
                    <div className="w-24 h-24 bg-gradient-eco rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-primary-foreground">{streakData.current}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Current Streak</h3>
                    <p className="text-sm text-muted-foreground">Days in a row</p>
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
                    <Badge className="bg-leaf-green text-primary-foreground">🔥 Hot Streak</Badge>
                    <Badge className="bg-forest-green text-primary-foreground">🌱 Eco Warrior</Badge>
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
                        <span>CO₂ Reduction Goal</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-1">25kg more to reach monthly goal</p>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">🌍</div>
                      <div className="text-2xl font-bold text-gradient-eco">{journeyStats.co2Saved}</div>
                      <div className="text-sm text-muted-foreground">CO₂ Saved</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Equivalent to planting 5 trees
                      </div>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">💰</div>
                      <div className="text-2xl font-bold text-gradient-eco">{journeyStats.moneyValue}</div>
                      <div className="text-sm text-muted-foreground">Environmental Value</div>
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
                    <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <div className="font-medium text-foreground">First Journey</div>
                        <div className="text-xs text-muted-foreground">Complete your first eco journey</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                      <div className="text-2xl">🌟</div>
                      <div>
                        <div className="font-medium text-foreground">Week Warrior</div>
                        <div className="text-xs text-muted-foreground">7 days in a row</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                      <div className="text-2xl">🌱</div>
                      <div>
                        <div className="font-medium text-foreground">Tree Saver</div>
                        <div className="text-xs text-muted-foreground">Saved 100kg CO₂</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg opacity-50">
                      <div className="text-2xl">🚌</div>
                      <div>
                        <div className="font-medium text-muted-foreground">Bus Master</div>
                        <div className="text-xs text-muted-foreground">50 bus journeys</div>
                      </div>
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
                    <h4 className="font-semibold text-foreground">Our Impact:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 10,000+ active eco-warriors</li>
                      <li>• 50,000kg+ CO₂ emissions prevented</li>
                      <li>• 25,000+ sustainable journeys completed</li>
                      <li>• Partnership with 100+ transit systems</li>
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
                    src={communityEco} 
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