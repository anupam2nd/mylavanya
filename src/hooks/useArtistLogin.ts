
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface LoginCredentials {
  email: string;
  password: string;
}

export function useArtistLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async ({ email, password }: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting artist login with:", email);
      // Explicitly convert email to lowercase for consistent matching
      const normalizedEmail = email.trim().toLowerCase();
      
      // Fix the query to properly handle types
      const { data, error } = await supabase
        .from('ArtistMST')
        .select('ArtistId, emailid, ArtistFirstName, ArtistLastName')
        .eq('emailid', normalizedEmail)
        .eq('password', password)
        .maybeSingle();
      
      console.log("Artist query result:", data, error);
      
      if (error) {
        console.error("Supabase query error:", error);
        throw new Error('Error querying artist');
      }
      
      if (!data) {
        throw new Error('Invalid credentials');
      }
      
      // Login using the context function with artist role
      login({
        id: data.ArtistId.toString(),
        email: data.emailid,
        role: 'artist',
        firstName: data.ArtistFirstName,
        lastName: data.ArtistLastName
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back! You are now logged in as an artist.`,
      });
      
      // Redirect to artist dashboard
      navigate('/artist/dashboard');

      return true;
    } catch (error) {
      console.error('Artist login error:', error);
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
