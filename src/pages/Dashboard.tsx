import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, MapPin, Navigation, Cloud, Leaf, Trophy, Star, Zap } from "lucide-react";
import Header from "@/components/Header";

const Dashboard = () => {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTicketFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Reset form
      setFromLocation("");
      setToLocation("");
      setTicketFile(null);
    }, 3000);
  };

  const leaderboardData = [
    { rank: 1, name: "Alex Green", points: 2450, co2Saved: "145kg" },
    { rank: 2, name: "Sarah Eco", points: 2200, co2Saved: "132kg" },
    { rank: 3, name: "Mike Transit", points: 1980, co2Saved: "118kg" },
    { rank: 4, name: "You", points: 1750, co2Saved: "105kg" },
    { rank: 5, name: "Emma Nature", points: 1650, co2Saved: "98kg" },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gradient-eco mb-2">Your Eco Dashboard</h1>
              <p className="text-muted-foreground">Upload your transport tickets and track your green journey</p>
            </div>

            {/* Upload Card */}
            <Card className="card-eco">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <span>Upload Journey Ticket</span>
                </CardTitle>
                <CardDescription>
                  Submit your public transport ticket to earn green points and track your environmental impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from" className="text-foreground font-medium">From</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="from"
                          placeholder="Starting location"
                          className="pl-10"
                          value={fromLocation}
                          onChange={(e) => setFromLocation(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to" className="text-foreground font-medium">To</Label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="to"
                          placeholder="Destination"
                          className="pl-10"
                          value={toLocation}
                          onChange={(e) => setToLocation(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket" className="text-foreground font-medium">Upload Ticket</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors duration-300 cursor-pointer">
                      <input
                        id="ticket"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        required
                      />
                      <label htmlFor="ticket" className="cursor-pointer">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                            <Upload className="h-8 w-8 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              {ticketFile ? ticketFile.name : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PNG, JPG, PDF up to 10MB
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-eco w-full flex items-center justify-center space-x-2" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Cloud className="h-4 w-4 animate-bounce" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Leaf className="h-4 w-4" />
                        <span>Process Journey</span>
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="card-eco text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-eco rounded-full flex items-center justify-center mx-auto mb-3">
                    <Leaf className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-gradient-eco">1,750</h3>
                  <p className="text-sm text-muted-foreground">Green Points</p>
                </CardContent>
              </Card>
              <Card className="card-eco text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-eco rounded-full flex items-center justify-center mx-auto mb-3">
                    <Cloud className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-gradient-eco">105kg</h3>
                  <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                </CardContent>
              </Card>
              <Card className="card-eco text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-eco rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-gradient-eco">42</h3>
                  <p className="text-sm text-muted-foreground">Journeys</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="card-eco">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Level Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">250 points to next level</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Monthly Goal</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">3 more journeys this month</p>
                </div>
                <Badge className="bg-accent text-accent-foreground">🏆 Eco Warrior</Badge>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="card-eco">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>Leaderboard</span>
                </CardTitle>
                <CardDescription>Top eco-friendly commuters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.map((user) => (
                    <div
                      key={user.rank}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                        user.name === "You" 
                          ? "bg-gradient-eco text-primary-foreground" 
                          : "bg-accent hover:bg-accent/80"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          user.rank <= 3 ? "bg-yellow-400 text-yellow-900" : "bg-muted"
                        }`}>
                          {user.rank}
                        </div>
                        <div>
                          <p className={`font-medium ${user.name === "You" ? "text-primary-foreground" : "text-foreground"}`}>
                            {user.name}
                          </p>
                          <p className={`text-xs ${user.name === "You" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {user.co2Saved} saved
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${user.name === "You" ? "text-primary-foreground" : "text-primary"}`}>
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