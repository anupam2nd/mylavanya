
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
      
      // Check if artist exists and is active
      const { data: artistData, error: artistError } = await supabase
        .from('ArtistMST')
        .select('ArtistId, emailid, ArtistFirstName, ArtistLastName, Active, password, uuid')
        .eq('emailid', normalizedEmail)
        .maybeSingle();
      
      if (artistError) {
        logger.error('Supabase query error during artist login');
        throw new Error('Error querying artist');
      }
      
      if (!artistData) {
        throw new Error('Artist not found');
      }
      
      // Check if artist is active
      if (artistData.Active === false) {
        throw new Error('Your account has been deactivated. Please contact support.');
      }
      
      if (!artistData.password) {
        throw new Error('Password not set for this artist');
      }

      // If artist has UUID, use Supabase Auth login
      if (artistData.uuid) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password
        });

        if (authError) {
          logger.error('Supabase auth login failed:', authError);
          throw new Error('Invalid email or password');
        }

        if (authData.user) {
          showToast("🎉 Login successful. Welcome back! You are now logged in as an artist.", 'success', 4000);
          navigate('/artist/dashboard');
          return true;
        }
      } else {
        // Fallback to password verification for artists not yet in Auth
        const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
          body: { 
            password: password,
            hashedPassword: artistData.password
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
        
        // Login using the context function with artist role
        const success = await login(artistData.emailid, password, 'artist');
        
        if (success) {
          showToast("🎉 Login successful. Welcome back! You are now logged in as an artist.", 'success', 4000);
          navigate('/artist/dashboard');
        }

        return success;
      }

      return false;
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
