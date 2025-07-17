import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Lightbulb, Globe, Mail, Github, Twitter } from "lucide-react";
import Header from "@/components/Header";
import communityEco from "@/assets/community-eco.png";
import treeLogo from "@/assets/tree-logo.png";

const About = () => {
  const teamMembers = [
    {
      name: "Alex Rivera",
      role: "Founder & CEO",
      description: "Environmental engineer passionate about sustainable transportation solutions.",
      emoji: "🌱"
    },
    {
      name: "Sarah Chen",
      role: "Head of Community",
      description: "Community builder focused on creating meaningful connections between eco-warriors.",
      emoji: "🤝"
    },
    {
      name: "Marcus Johnson",
      role: "Tech Lead",
      description: "Full-stack developer building scalable solutions for environmental impact tracking.",
      emoji: "💻"
    },
    {
      name: "Elena Popova",
      role: "UX Designer",
      description: "Designer creating intuitive experiences that encourage sustainable behavior change.",
      emoji: "🎨"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion for Planet",
      description: "We genuinely care about the environment and are committed to making a positive impact through technology and community."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We believe that collective action creates the biggest impact. Our platform is built to foster community and collaboration."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We use technology and creative thinking to make sustainable choices easier and more rewarding for everyone."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "While we start local, our vision is global. We're building solutions that can scale to cities worldwide."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-nature relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={communityEco} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <img src={treeLogo} alt="Go Green" className="h-20 w-20 animate-gentle-bounce" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gradient-eco mb-6">
              About Go Green
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're a team of passionate individuals united by our commitment to creating a more sustainable world 
              through innovative transport solutions and community engagement.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-gradient-eco">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Go Green started as a simple idea during a particularly smoggy day in downtown metro. 
                    Our founder, Alex, was commuting to work and noticed how many single-occupancy vehicles 
                    were contributing to the air pollution problem.
                  </p>
                  <p>
                    "What if we could make sustainable transport choices as rewarding as they are responsible?" 
                    This question led to the creation of Go Green - a platform that not only tracks your 
                    eco-friendly journeys but celebrates and rewards them.
                  </p>
                  <p>
                    Since our launch in 2024, we've grown from a small team of four to a thriving community 
                    of over 10,000 users across 50+ cities. Our platform has helped save over 50,000kg of 
                    CO₂ emissions and has contributed to planting more than 1,000 trees.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-leaf-green text-primary-foreground px-4 py-2">🌱 Founded 2024</Badge>
                  <Badge className="bg-forest-green text-primary-foreground px-4 py-2">🌍 50+ Cities</Badge>
                  <Badge className="bg-primary text-primary-foreground px-4 py-2">👥 10K+ Users</Badge>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-eco rounded-3xl transform rotate-3"></div>
                <img 
                  src={communityEco} 
                  alt="Go Green Community" 
                  className="relative w-full h-auto rounded-3xl shadow-card"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gradient-eco mb-4">Our Values</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                These core values guide every decision we make and every feature we build.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="card-eco text-center group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-eco rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <value.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gradient-eco mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The passionate individuals working to make sustainable transport accessible and rewarding for everyone.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="card-eco text-center group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {member.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Social */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Get In Touch</h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Have questions, suggestions, or want to partner with us? We'd love to hear from you!
            </p>
            
            <div className="flex justify-center space-x-6 mb-8">
              <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                <Mail className="h-8 w-8" />
              </div>
              <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                <Twitter className="h-8 w-8" />
              </div>
              <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                <Github className="h-8 w-8" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-primary-foreground/60 text-sm">
                📧 hello@gogreen.eco | 🌐 Follow us on social media for updates
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;