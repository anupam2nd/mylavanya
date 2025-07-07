
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";
import { convertToAuthFormat, isPhoneInput, isEmailInput } from "@/utils/syntheticEmail";

interface MemberLoginCredentials {
  emailOrPhone: string;
  password: string;
}

export function useMemberLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useCustomToast();

  const handleLogin = async ({ emailOrPhone, password }: MemberLoginCredentials, shouldNavigate: boolean = true) => {
    setIsLoading(true);
    
    try {
      const normalizedInput = emailOrPhone.trim();
      
      // Validate input format
      const isEmail = isEmailInput(normalizedInput);
      const isPhone = isPhoneInput(normalizedInput);
      
      if (!isEmail && !isPhone) {
        throw new Error('Please enter a valid email address or 10-digit phone number');
      }
      
      // Convert phone number to synthetic email if needed
      const authEmail = convertToAuthFormat(normalizedInput);
      
      logger.debug('Attempting login with:', { 
        originalInput: normalizedInput, 
        authEmail, 
        isPhone, 
        isEmail 
      });
      
      // Use Supabase auth for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password,
      });

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
