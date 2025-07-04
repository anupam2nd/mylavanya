
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";
import { ensureSupabaseSession } from "@/utils/authUtils";

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useCustomToast();

  const handleLogin = async ({ email, password }: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      // Explicitly convert email to lowercase for consistent matching
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('UserMST')
        .select('id, uuid, email_id, role, FirstName, LastName, password, active')
        .ilike('email_id', normalizedEmail)
        .eq('active', true)
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
      
      // Create user object
      const userObj = {
        id: data.uuid,
        email: data.email_id,
        role: data.role,
        firstName: data.FirstName,
        lastName: data.LastName
      };

      // Login using the context function (this will attempt to create Supabase session)
      await login(userObj);
      
      // Ensure Supabase session is established for data access
      await ensureSupabaseSession(userObj);
      
      showToast(`🎉 Login successful. Welcome back! You are now logged in as ${data.role}.`, 'success', 4000);
      
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
      showToast("❌ Invalid email or password. Please try again.", 'error', 4000);
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
