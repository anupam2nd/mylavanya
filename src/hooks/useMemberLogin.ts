
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";
import { generateSyntheticEmail, isEmailInput, isPhoneInput } from "@/utils/syntheticEmail";

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
      
      let authEmail: string;
      
      if (isEmailInput(normalizedInput)) {
        // Login with email
        authEmail = normalizedInput.toLowerCase();
        logger.debug('Attempting login with email:', authEmail);
      } else if (isPhoneInput(normalizedInput)) {
        // Convert phone to synthetic email for login
        authEmail = generateSyntheticEmail(normalizedInput);
        logger.debug('Attempting login with phone converted to synthetic email:', authEmail);
      } else {
        throw new Error('Please enter a valid email address or 10-digit phone number');
      }
      
      // Use Supabase email authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password,
      });

      if (error) {
        logger.error('Supabase auth login failed:', error);
        throw new Error('Invalid credentials');
      }
      
      if (data.user) {
        // Verify user exists in MemberMST table
        const { data: memberData, error: memberError } = await supabase
          .from('MemberMST')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (memberError || !memberData) {
          logger.error('User not found in MemberMST table');
          // Sign out the user since they're not a valid member
          await supabase.auth.signOut();
          throw new Error('Access denied. This login is only for registered members.');
        }

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
