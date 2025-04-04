
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async ({ email, password }: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", email);
      // Explicitly convert email to lowercase for consistent matching
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('UserMST')
        .select('id, Username, role')
        .ilike('Username', normalizedEmail)
        .eq('password', password)
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
      
      // Redirect based on specific role
      if (data.role === 'superadmin') {
        navigate('/admin/status');
      } else if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleLogin,
  };
}
