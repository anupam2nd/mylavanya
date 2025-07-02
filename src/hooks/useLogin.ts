
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";
import { toast } from "sonner";

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
        .select('id, email_id, role, FirstName, LastName, password')
        .ilike('email_id', normalizedEmail)
        .maybeSingle();
      
      if (error) {
        toast.error('Error querying user');
        return false;
      }
      
      if (!data) {
        toast.error('Invalid credentials');
        return false;
      }
      
      if (!data.password) {
        toast.error('Invalid credentials');
        return false;
      }
      
      // Verify password using the edge function
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
        body: { 
          password: password,
          hashedPassword: data.password
        }
      });
      
      if (verifyError) {
        toast.error('Invalid credentials');
        return false;
      }
      
      if (!verifyResult?.isValid) {
        toast.error('Invalid credentials');
        return false;
      }
      
      // Create a session for this user in Supabase for JWT-based auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password
      }).catch(error => {
        return { data: null, error };
      });
      
      // Login using the context function
      login({
        id: data.id.toString(),
        email: data.email_id,
        role: data.role,
        firstName: data.FirstName,
        lastName: data.LastName
      });
      
      toast.success('Login successful! Welcome back.');
      
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
      toast.error('Login failed. Please try again.');
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
