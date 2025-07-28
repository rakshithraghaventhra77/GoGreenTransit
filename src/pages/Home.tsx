import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Target, Users, TreePine, Sparkles, Globe, Zap, Leaf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

import DistanceReward from "../components/DistanceReward";

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50"
        style={{
          backgroundImage: `url(/hero-eco-transport.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 opacity-30 animate-float">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-200 to-emerald-300 blur-xl"></div>
          </div>
          <div className="absolute top-40 left-20 opacity-20 animate-leaf-fall">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 to-green-200 blur-lg"></div>
          </div>
          <div className="absolute bottom-40 right-40 opacity-25 animate-gentle-bounce">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-200 to-teal-300 blur-lg"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
            <div className="w-96 h-96 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 blur-3xl animate-pulse"></div>
          </div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-eco rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <img src="/tree-logo.png" alt="Go Green" className="h-24 w-24 relative z-10 animate-gentle-bounce" />
                </div>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-gradient-eco mb-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
                Go Green
              </h1>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Sparkles className="h-6 w-6 text-green-500 animate-pulse" />
                <p className="text-2xl md:text-3xl font-medium text-foreground/80">
                  Sustainable • Rewarding • Community
                </p>
                <Sparkles className="h-6 w-6 text-green-500 animate-pulse" />
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Join the sustainable transport revolution. Earn rewards for every eco-friendly journey and help reduce our carbon footprint together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button className="btn-eco text-lg px-10 py-6 rounded-2xl" asChild>
                  <Link to="/dashboard">
                    <Zap className="mr-3 h-5 w-5" />
                    Start Your Journey
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" className="text-lg px-8 py-6 rounded-2xl border-2" asChild>
                  <Link to="/about">
                    <Globe className="mr-2 h-5 w-5" />
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Track Impact</h3>
                <p className="text-muted-foreground">Monitor your carbon savings and environmental impact in real-time</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Earn Rewards</h3>
                <p className="text-muted-foreground">Get points and unlock exclusive rewards for sustainable choices</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Join Community</h3>
                <p className="text-muted-foreground">Connect with like-minded eco-warriors making a difference</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Cards Section */}
      <section className="py-24 relative bg-gradient-to-b from-transparent to-accent/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-eco mb-6">Explore Our Platform</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover how we're making sustainable transport accessible, rewarding, and fun for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {/* Goals Card */}
            <Link to="/goals" className="group">
              <Card className="card-eco h-full transition-all duration-500 hover:rotate-1">
                <CardContent className="p-10 text-center h-full flex flex-col justify-between relative overflow-hidden">
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl">
                      <Target className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-foreground mb-6">Our Goals</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Discover our mission to reduce carbon emissions through sustainable public transport usage and community engagement.
                    </p>
                  </div>
                  <div className="mt-8 flex items-center justify-center text-primary font-semibold group-hover:translate-x-3 transition-all duration-300">
                    Learn More <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Central Go Green Card */}
            <Link to="/dashboard" className="group">
              <Card className="relative overflow-hidden h-full transform scale-105 transition-all duration-500 hover:scale-110 hover:-rotate-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-white/20"></div>

                <CardContent className="relative z-10 p-10 text-center h-full flex flex-col justify-between text-white">
                  <div>
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl border border-white/30">
                      <TreePine className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold mb-6">Go Green</h3>
                    <p className="text-white/90 leading-relaxed font-medium text-lg">
                      Start your eco-friendly journey today. Upload tickets, track progress, and earn rewards for sustainable transport choices.
                    </p>
                  </div>
                  <Button className="mt-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 rounded-2xl py-4 px-8 font-semibold transition-all duration-300 group-hover:scale-105">
                    <Zap className="mr-2 h-5 w-5" />
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* About Us Card */}
            <Link to="/about" className="group">
              <Card className="card-eco h-full transition-all duration-500 hover:-rotate-1">
                <CardContent className="p-10 text-center h-full flex flex-col justify-between relative overflow-hidden">
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-foreground mb-6">About Us</h3>
                    <div className="mb-6 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <img src="/community-eco.png" alt="Community" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Learn about our team, mission, and how we're building a sustainable future through community-driven transport solutions.
                    </p>
                  </div>
                  <div className="mt-8 flex items-center justify-center text-primary font-semibold group-hover:translate-x-3 transition-all duration-300">
                    Read More <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-emerald-400/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-teal-400/10 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Impact Together</h2>
            <p className="text-green-100 text-xl max-w-2xl mx-auto">
              See the amazing environmental impact we're creating as a community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center max-w-5xl mx-auto">
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-300 mr-3" />
                  <div className="text-5xl font-bold text-white animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">10,000+</div>
                </div>
                <div className="text-green-100 font-medium text-lg">Active Users</div>
                <p className="text-green-200/80 text-sm mt-2">Growing eco-community</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <Leaf className="h-8 w-8 text-green-300 mr-3" />
                  <div className="text-5xl font-bold text-white animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">50,000kg</div>
                </div>
                <div className="text-green-100 font-medium text-lg">CO₂ Saved</div>
                <p className="text-green-200/80 text-sm mt-2">Environmental impact</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-green-300 mr-3" />
                  <div className="text-5xl font-bold text-white animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-400">25,000+</div>
                </div>
                <div className="text-green-100 font-medium text-lg">Green Journeys</div>
                <p className="text-green-200/80 text-sm mt-2">Sustainable trips logged</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Distance Reward Section */}
      <DistanceReward />

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src="/tree-logo.png" alt="Go Green" className="h-8 w-8" />
              <span className="text-xl font-bold">Go Green</span>
            </div>
            <div className="text-sm text-primary-foreground/80">
              © 2024 Go Green. Making transport sustainable, one journey at a time.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
