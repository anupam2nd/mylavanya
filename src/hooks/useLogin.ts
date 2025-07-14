
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
      console.log('Starting login process for:', normalizedEmail);
      
      // First try Supabase Auth login (for migrated admin users)
      console.log('Attempting Supabase Auth login first');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!authError && authData.user) {
        console.log('Supabase Auth login successful');
        
        // Check if this is an admin user by checking UserMST
        const { data: userData, error: userError } = await supabase
          .from('UserMST')
          .select('id, email_id, role, FirstName, LastName')
          .ilike('email_id', normalizedEmail)
          .eq('active', true)
          .maybeSingle();
        
        if (!userError && userData && ['admin', 'superadmin', 'controller'].includes(userData.role)) {
          console.log('Migrated admin user logged in via Supabase Auth:', userData.role);
          return true; // AuthProvider will handle the session
        } else {
          console.log('Regular user logged in via Supabase Auth');
          return true; // AuthProvider will handle the session
        }
      }
      
      // If Supabase Auth failed, try legacy admin login
      console.log('Supabase Auth failed, checking for legacy admin user');
      const { data, error } = await supabase
        .from('UserMST')
        .select('id, email_id, role, FirstName, LastName, password, active')
        .ilike('email_id', normalizedEmail)
        .eq('active', true)
        .maybeSingle();
      
      if (error) {
        logger.error('Supabase query error during admin login check');
        console.error('Database query error:', error);
        throw new Error('Error querying user');
      }
      
      if (!data) {
        console.log('No user found in UserMST');
        throw new Error('Invalid credentials');
      }
      
      console.log('Legacy admin user found:', data.role, data.email_id);
      
      if (!data.password) {
        throw new Error('Password not set for this user');
      }
      
      // Verify password using the edge function for legacy users
      console.log('Verifying password for legacy admin user');
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
        body: { 
          password: password,
          hashedPassword: data.password
        }
      });
      
      if (verifyError) {
        logger.error('Error verifying password');
        console.error('Password verification error:', verifyError);
        throw new Error('Invalid credentials');
      }
      
      if (!verifyResult?.isValid) {
        logger.debug('Password verification failed for admin/controller');
        console.log('Password verification failed');
        throw new Error('Invalid credentials');
      }
      
      // Login using the context function with admin role (legacy approach)
      console.log('Password verified, logging in legacy admin user');
      const success = await login(data.email_id, password, data.role);
      
      if (success) {
        showToast(`🎉 Login successful. Welcome back! You are now logged in as ${data.role}.`, 'success', 4000);
        
        // Redirect based on role
        if (data.role === 'superadmin' || data.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.role === 'controller') {
          navigate('/controller/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }

      return success;
    } catch (error) {
      logger.error('Login failed');
      console.error('Login error details:', error);
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
