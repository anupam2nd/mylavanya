
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
    setIsLoading(true);
    
    try {
      // Explicitly convert email to lowercase for consistent matching
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('UserMST')
        .select('id, email_id, role, FirstName, LastName')
        .ilike('email_id', normalizedEmail)
        .eq('password', password)
        .maybeSingle();
      
      if (error) {
        logger.error('Supabase query error during admin login');
        throw new Error('Error querying user');
      }
      
      if (!data) {
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
      
      // Login using the context function
      login({
        id: data.id.toString(),
        email: data.email_id,
        role: data.role,
        firstName: data.FirstName,
        lastName: data.LastName
      });
      
      toast.success("Login successful", {
        description: `Welcome back! You are now logged in as ${data.role}.`,
      });
      
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
