import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";


const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        navigate("/login");
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-nature relative overflow-hidden flex items-center justify-center">
      {/* Floating leaves background */}
      <div className="absolute top-10 left-10 opacity-20">
        <img src="/floating-leaves.svg" alt="" className="w-32 h-24 animate-float" />
      </div>
      <div className="absolute top-32 right-20 opacity-15">
        <img src="/floating-leaves.svg" alt="" className="w-24 h-18 animate-leaf-fall" />
      </div>
      <div className="absolute bottom-20 left-1/4 opacity-25">
        <img src="/floating-leaves.svg" alt="" className="w-28 h-20 animate-float" />
      </div>
      <div className="absolute bottom-32 right-10 opacity-20">
        <img src="/floating-leaves.svg" alt="" className="w-20 h-15 animate-leaf-fall" />
      </div>

      {/* Animated trees */}
      <div className="absolute bottom-0 left-0 right-0 opacity-10">
        <div className="flex justify-around">
          <TreePine className="h-24 w-24 text-forest-green animate-gentle-bounce" />
          <TreePine className="h-32 w-32 text-leaf-green animate-float" />
          <TreePine className="h-28 w-28 text-forest-green animate-gentle-bounce" style={{
            animationDelay: '1s'
          }} />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <img src="/tree-logo.svg" alt="Go Green" className="h-12 w-12" />
              <span className="text-3xl font-bold text-gradient-eco">Go Green</span>
            </Link>
            <p className="text-muted-foreground mt-2">Join the sustainable transport revolution</p>
          </div>

          {/* Signup Card */}
          <Card className="card-eco backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-foreground">Create Account</CardTitle>
              <CardDescription className="text-center">
                Start your eco-friendly journey today
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      name="name" 
                      type="text" 
                      placeholder="Your full name" 
                      className="pl-10 border-border/50 focus:border-primary" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      className="pl-10 border-border/50 focus:border-primary" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 border-border/50 focus:border-primary" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 border-border/50 focus:border-primary" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="btn-eco w-full"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="text-xs">
              <div className="text-2xl mb-1">🌱</div>
              <div className="text-muted-foreground">Earn Rewards</div>
            </div>
            <div className="text-xs">
              <div className="text-2xl mb-1">🌍</div>
              <div className="text-muted-foreground">Save Planet</div>
            </div>
            <div className="text-xs">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-muted-foreground">Join Community</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
