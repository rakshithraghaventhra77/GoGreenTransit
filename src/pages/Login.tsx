import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login failed",
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
          <TreePine className="h-28 w-28 text-forest-green animate-gentle-bounce" style={{ animationDelay: '1s' }} />
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
            <p className="text-muted-foreground mt-2">Welcome back to your eco journey</p>
          </div>

          {/* Login Card */}
          <Card className="card-eco backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-foreground">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 border-border/50 focus:border-primary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 border-border/50 focus:border-primary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="btn-eco w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              🌱 Join thousands of users making a difference through sustainable transport
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
