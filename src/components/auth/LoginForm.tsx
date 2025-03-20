
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonCustom } from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface LoginFormProps {
  onSwitchTab: () => void;
}

export default function LoginForm({ onSwitchTab }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
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
        .select('id, Username, role, active')
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
      
      // Check if user is active
      if (!data.active) {
        throw new Error('Account is inactive. Please contact an administrator.');
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
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
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
  );
}
