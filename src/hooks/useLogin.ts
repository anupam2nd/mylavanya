
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async ({ email, password }: LoginCredentials) => {
    console.log('Login process started - checking for layout issues');
    setIsLoading(true);
    
    try {
      // Explicitly convert email to lowercase for consistent matching
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('UserMST')
        .select('id, email_id, role, FirstName, LastName, password')
        .ilike('email_id', normalizedEmail)
        .maybeSingle();
      
      if (error) {
        logger.error('Supabase query error during admin login');
        throw new Error('Error querying user');
      }
      
      if (!data) {
        throw new Error('Invalid credentials');
      }
      
      if (!data.password) {
        throw new Error('Invalid credentials');
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
        throw new Error('Invalid credentials');
      }
      
      if (!verifyResult?.isValid) {
        logger.debug('Password verification failed for admin/controller');
        throw new Error('Invalid credentials');
      }
      
      // Create a session for this user in Supabase for JWT-based auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password
      }).catch(error => {
        logger.debug('Auth sign-in failed, using custom auth only');
        return { data: null, error };
      });
      
      if (authData?.session) {
        logger.debug('Supabase auth session established');
      } else {
        logger.debug('Using custom auth only, no Supabase session');
      }
      
      console.log('About to call login context - this might cause layout shift');
      
      // Login using the context function
      login({
        id: data.id.toString(),
        email: data.email_id,
        role: data.role,
        firstName: data.FirstName,
        lastName: data.LastName
      });
      
      console.log('Login context called, showing toast now');
      
      // Use a shorter duration and simpler message to reduce layout impact
      toast.success("Login successful", {
        description: `Welcome back! You are now logged in as ${data.role}.`,
        duration: 3000,
      });
      
      console.log('Toast shown, about to navigate');
      
      // Fixed redirect logic for superadmin and admin
      if (data.role === 'superadmin' || data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'controller') {
        navigate('/controller/dashboard');
      } else if (data.role === 'artist') {
        navigate('/artist/dashboard');
      } else {
        navigate('/user/dashboard');
      }

      return true;
    } catch (error) {
      logger.error('Admin login failed');
      toast.error("Login failed", {
        description: "Invalid email or password. Please try again.",
        duration: 3000,
      });
      return false;
    } finally {
      console.log('Login process finished, setting loading to false');
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleLogin,
  };
}
