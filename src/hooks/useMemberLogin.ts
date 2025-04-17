
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface MemberLoginCredentials {
  email: string;
  password: string;
}

export function useMemberLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async ({ email, password }: MemberLoginCredentials) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting member login with:", email);
      // Explicitly convert email to lowercase for consistent matching
      const normalizedEmail = email.trim().toLowerCase();
      
      // First, verify password through edge function
      const { data, error } = await supabase.functions.invoke('verify-password', {
        body: { 
          email: normalizedEmail,
          password,
          type: 'member'
        }
      });
      
      console.log("Login verification response:", data);
      
      if (error || !data.isValid) {
        console.error("Login verification error:", error || "Invalid credentials");
        throw new Error('Invalid credentials');
      }

      const userData = data.user;
      
      // Login using the context function
      login({
        id: userData.id.toString(),
        email: userData.MemberEmailId,
        role: 'member',
        firstName: userData.MemberFirstName,
        lastName: userData.MemberLastName
      });
      
      toast.success("Login successful. Welcome back!");
      navigate('/');

      return true;
    } catch (error) {
      console.error('Member login error:', error);
      toast.error("Invalid email or password. Please try again.");
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
