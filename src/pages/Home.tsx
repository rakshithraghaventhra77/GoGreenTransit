import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Target, Users, TreePine } from "lucide-react";
import Header from "@/components/Header";
import heroImage from "@/assets/hero-eco-transport.jpg";
import floatingLeaves from "@/assets/floating-leaves.png";
import communityEco from "@/assets/community-eco.png";
import treeLogo from "@/assets/tree-logo.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden bg-gradient-nature"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent"></div>
        
        {/* Floating elements */}
        <div className="absolute top-10 right-10 opacity-30">
          <img src={floatingLeaves} alt="" className="w-32 h-24 animate-float" />
        </div>
        <div className="absolute bottom-20 left-10 opacity-20">
          <img src={floatingLeaves} alt="" className="w-24 h-18 animate-leaf-fall" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <img src={treeLogo} alt="Go Green" className="h-20 w-20 animate-gentle-bounce" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gradient-eco mb-6">
              Go Green
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the sustainable transport revolution. Earn rewards for every eco-friendly journey and help reduce our carbon footprint together.
            </p>
            <Button className="btn-eco text-lg px-8 py-4" asChild>
              <Link to="/dashboard">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Cards Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Goals Card */}
            <Link to="/goals">
              <Card className="card-eco group cursor-pointer">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-gradient-eco rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Our Goals</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Discover our mission to reduce carbon emissions through sustainable public transport usage and community engagement.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Central Go Green Card */}
            <Link to="/dashboard">
              <Card className="card-nature group cursor-pointer scale-105 md:scale-110">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-6 shadow-card group-hover:shadow-hover transition-all duration-300">
                      <TreePine className="h-10 w-10 text-forest-green" />
                    </div>
                    <h3 className="text-3xl font-bold text-gradient-eco mb-4">Go Green</h3>
                    <p className="text-foreground/80 leading-relaxed font-medium">
                      Start your eco-friendly journey today. Upload tickets, track progress, and earn rewards for sustainable transport choices.
                    </p>
                  </div>
                  <Button className="btn-eco mt-6 group-hover:scale-105 transition-transform duration-300">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* About Us Card */}
            <Link to="/about">
              <Card className="card-eco group cursor-pointer">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-gradient-eco rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">About Us</h3>
                    <div className="mb-4">
                      <img src={communityEco} alt="Community" className="w-full h-32 object-cover rounded-lg" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Learn about our team, mission, and how we're building a sustainable future through community-driven transport solutions.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-accent/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gradient-eco">10,000+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gradient-eco">50,000kg</div>
              <div className="text-muted-foreground">CO₂ Saved</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gradient-eco">25,000+</div>
              <div className="text-muted-foreground">Green Journeys</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src={treeLogo} alt="Go Green" className="h-8 w-8" />
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