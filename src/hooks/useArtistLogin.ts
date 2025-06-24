
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";

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
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('ArtistMST')
        .select('ArtistId, emailid, ArtistFirstName, ArtistLastName, password, Active')
        .eq('emailid', normalizedEmail)
        .maybeSingle();
      
      if (error) {
        logger.error('Supabase query error during artist login');
        throw new Error('Error querying artist');
      }
      
      if (!data) {
        throw new Error('Artist not found');
      }
      
      // Check if artist is active
      if (data.Active === false) {
        throw new Error('Your account has been deactivated. Please contact support.');
      }
      
      if (!data.password) {
        throw new Error('Password not set for this artist');
      }
      
      if (data.password !== password) {
        throw new Error('Invalid password');
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
      logger.error('Artist login failed');
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
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
