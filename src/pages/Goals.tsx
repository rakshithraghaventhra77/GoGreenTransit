import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Leaf, Users, TrendingDown, TreePine, Recycle } from "lucide-react";
import Header from "@/components/Header";
import heroImage from "@/assets/hero-eco-transport.jpg";

const Goals = () => {
  const goals = [
    {
      icon: TrendingDown,
      title: "Reduce Carbon Emissions",
      description: "Our primary goal is to reduce global carbon emissions by encouraging the use of public transport over private vehicles.",
      impact: "Every journey on public transport can reduce CO₂ emissions by up to 75% compared to driving alone.",
      color: "text-red-500"
    },
    {
      icon: TreePine,
      title: "Reforestation Impact",
      description: "For every 100kg of CO₂ saved through our platform, we contribute to tree planting initiatives worldwide.",
      impact: "We've contributed to planting over 1,000 trees through our community's collective efforts.",
      color: "text-forest-green"
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Build a strong community of environmentally conscious individuals who inspire each other to make sustainable choices.",
      impact: "Our community has grown to over 10,000 active members across 50+ cities.",
      color: "text-primary"
    },
    {
      icon: Recycle,
      title: "Sustainable Habits",
      description: "Help individuals develop long-term sustainable transportation habits through gamification and rewards.",
      impact: "85% of our users continue using public transport 6 months after joining our program.",
      color: "text-leaf-green"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden bg-gradient-nature py-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-eco rounded-full flex items-center justify-center animate-gentle-bounce">
                <Target className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gradient-eco mb-6">
              Our Mission & Goals
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make sustainable transportation the preferred choice for everyone, 
              creating a cleaner planet one journey at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Goals Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gradient-eco mb-4">
                What We're Working Towards
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Every goal we set is designed to create meaningful environmental impact while building a sustainable future for generations to come.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {goals.map((goal, index) => (
                <Card key={index} className="card-eco group hover:scale-[1.02] transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-eco rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <goal.icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground">{goal.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {goal.description}
                    </p>
                    <div className="bg-accent p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">Impact So Far:</h4>
                      <p className="text-sm text-foreground">{goal.impact}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-eco mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of the solution. Every sustainable journey counts towards our collective goal 
              of creating a cleaner, greener planet.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-gradient-eco rounded-full flex items-center justify-center mx-auto">
                  <Leaf className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Start Today</h3>
                <p className="text-muted-foreground">Upload your first transport ticket and begin earning green points.</p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 bg-gradient-eco rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Build Community</h3>
                <p className="text-muted-foreground">Connect with like-minded individuals and share your eco journey.</p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 bg-gradient-eco rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Make Impact</h3>
                <p className="text-muted-foreground">Track your environmental impact and see your contribution to our goals.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gradient-eco mb-12">Our Progress</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <Card className="card-eco">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gradient-eco mb-2">50,000kg</div>
                  <div className="text-sm text-muted-foreground">CO₂ Emissions Saved</div>
                </CardContent>
              </Card>
              <Card className="card-eco">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gradient-eco mb-2">1,000+</div>
                  <div className="text-sm text-muted-foreground">Trees Planted</div>
                </CardContent>
              </Card>
              <Card className="card-eco">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gradient-eco mb-2">10,000+</div>
                  <div className="text-sm text-muted-foreground">Community Members</div>
                </CardContent>
              </Card>
              <Card className="card-eco">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gradient-eco mb-2">85%</div>
                  <div className="text-sm text-muted-foreground">Habit Retention Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Goals;