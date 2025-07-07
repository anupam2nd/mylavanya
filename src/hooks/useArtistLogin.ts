
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
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
  const { showToast } = useCustomToast();

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
      
      // Verify password using the edge function
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
        body: { 
          password: password,
          hashedPassword: data.password
        }
      });
      
      if (verifyError) {
        logger.error('Error verifying password');
        throw new Error('Invalid password');
      }
      
      if (!verifyResult?.isValid) {
        logger.debug('Password verification failed for artist');
        throw new Error('Invalid password');
      }
      
      // Login using the context function with artist role - fix: pass email and password
      const success = await login(data.emailid, password, 'artist');
      
      if (success) {
        showToast("🎉 Login successful. Welcome back! You are now logged in as an artist.", 'success', 4000);
        
        // Redirect to artist dashboard
        navigate('/artist/dashboard');
      }

      return success;
    } catch (error) {
      logger.error('Artist login failed');
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password. Please try again.";
      showToast("❌ " + errorMessage, 'error', 4000);
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
