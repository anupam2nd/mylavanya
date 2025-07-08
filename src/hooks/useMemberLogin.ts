
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";

interface MemberLoginCredentials {
  emailOrPhone: string;
  password: string;
}

export function useMemberLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useCustomToast();

  const isEmailInput = (input: string): boolean => {
    return input.includes('@');
  };

  const isPhoneInput = (input: string): boolean => {
    const cleanInput = input.replace(/\D/g, '');
    return cleanInput.length === 10 && /^\d{10}$/.test(cleanInput);
  };

  const handleLogin = async ({ emailOrPhone, password }: MemberLoginCredentials, shouldNavigate: boolean = true) => {
    setIsLoading(true);
    
    try {
      const normalizedInput = emailOrPhone.trim();
      
      let authCredentials: { email?: string; phone?: string; password: string };
      
      if (isEmailInput(normalizedInput)) {
        // Login with email
        authCredentials = {
          email: normalizedInput.toLowerCase(),
          password: password,
        };
      } else if (isPhoneInput(normalizedInput)) {
        // Login with phone number
        authCredentials = {
          phone: `+91${normalizedInput}`,
          password: password,
        };
      } else {
        throw new Error('Please enter a valid email address or 10-digit phone number');
      }
      
      logger.debug('Attempting login with:', { 
        type: authCredentials.email ? 'email' : 'phone',
        credential: authCredentials.email || authCredentials.phone
      });
      
      // Use Supabase auth for login
      const { data, error } = await supabase.auth.signInWithPassword(authCredentials);

      if (error) {
        logger.error('Supabase auth login failed:', error);
        throw new Error('Invalid credentials');
      }
      
      if (data.user) {
        logger.debug('Login successful');
        showToast("🎉 Login successful. Welcome back!", 'success', 4000);
        
        // Only navigate if shouldNavigate is true
        if (shouldNavigate) {
          navigate('/');
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Member login failed:', error);
      showToast("❌ " + (error instanceof Error ? error.message : "Invalid email/phone or password. Please try again."), 'error', 4000);
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
