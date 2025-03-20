
import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonCustom } from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", loginData.email);
      // Explicitly convert email to lowercase for consistent matching
      const email = loginData.email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('UserMST')
        .select('id, Username, role')
        .ilike('Username', email)
        .eq('password', loginData.password)
        .maybeSingle();
      
      console.log("Query result:", data, error);
      
      if (error) {
        console.error("Supabase query error:", error);
        throw new Error('Error querying user');
      }
      
      if (!data) {
        throw new Error('Invalid credentials');
      }
      
      // Login using the context function
      login({
        id: data.id.toString(),
        email: data.Username,
        role: data.role
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back! You are now logged in as ${data.role}.`,
      });
      
      onClose();
      
      // Redirect based on role
      if (data.role === 'superadmin' || data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Convert email to lowercase for consistency
      const email = registerData.email.trim().toLowerCase();
      
      console.log("Attempting to register:", email);
      
      // Check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('UserMST')
        .select('Username')
        .ilike('Username', email);
      
      console.log("Check for existing user:", existingUsers, checkError);
      
      if (checkError) {
        console.error("Error checking existing user:", checkError);
        throw new Error('Error checking if user exists');
      }
      
      if (existingUsers && existingUsers.length > 0) {
        console.log("User already exists:", existingUsers);
        throw new Error('User already exists');
      }
      
      // Insert new user with default 'user' role
      const { data, error: insertError } = await supabase
        .from('UserMST')
        .insert([
          { 
            Username: email,
            password: registerData.password,
            role: 'user',
            FirstName: registerData.firstName, 
            LastName: registerData.lastName
          }
        ])
        .select();
      
      console.log("Insert result:", data, insertError);
      
      if (insertError) {
        console.error("Error inserting new user:", insertError);
        throw insertError;
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });
      
      // Switch to login tab
      setActiveTab("login");
      setLoginData({ email, password: registerData.password });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="pt-6 px-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {activeTab === "login" ? "Sign In" : "Create Account"}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={onClose}
              disabled={isLoading}
            >
              <X size={18} />
            </Button>
          </div>
        </DialogHeader>
        
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as "login" | "register")}
          className="w-full"
        >
          <div className="px-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6 pt-4">
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input 
                    id="email-login" 
                    type="email" 
                    placeholder="Your email address" 
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-login">Password</Label>
                    <Button 
                      type="button"
                      variant="link" 
                      className="p-0 h-auto text-xs"
                      onClick={() => toast({
                        title: "Password Reset",
                        description: "Please contact your administrator to reset your password.",
                      })}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input 
                    id="password-login" 
                    type="password" 
                    placeholder="Your password" 
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                </div>
                <ButtonCustom 
                  variant="primary-gradient" 
                  className="w-full"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </ButtonCustom>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input 
                      id="first-name" 
                      placeholder="First name" 
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input 
                      id="last-name" 
                      placeholder="Last name" 
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input 
                    id="email-register" 
                    type="email" 
                    placeholder="Your email address" 
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Password</Label>
                  <Input 
                    id="password-register" 
                    type="password" 
                    placeholder="Create a password" 
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    required
                  />
                </div>
                <ButtonCustom 
                  variant="primary-gradient" 
                  className="w-full"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </ButtonCustom>
              </form>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="p-6 pt-2 border-t">
          <div className="text-center text-sm">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
