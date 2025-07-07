
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

  const handleLogin = async ({ emailOrPhone, password }: MemberLoginCredentials, shouldNavigate: boolean = true) => {
    setIsLoading(true);
    
    try {
      const normalizedInput = emailOrPhone.trim().toLowerCase();
      
      // Determine if input is email or phone number
      const isEmail = normalizedInput.includes('@');
      const isPhone = /^\d{10}$/.test(normalizedInput);
      
      if (!isEmail && !isPhone) {
        throw new Error('Please enter a valid email address or 10-digit phone number');
      }
      
      let memberData;
      let memberError;
      
      logger.debug('Starting member login process');
      
      if (isEmail) {
        // Search by email
        const { data, error } = await supabase
          .from('MemberMST')
          .select('id, MemberFirstName, MemberLastName, MemberEmailId, MemberPhNo, MemberAdress, MemberPincode, password')
          .ilike('MemberEmailId', normalizedInput)
          .maybeSingle();
        memberData = data;
        memberError = error;
      } else {
        // Search by phone number
        const { data, error } = await supabase
          .from('MemberMST')
          .select('id, MemberFirstName, MemberLastName, MemberEmailId, MemberPhNo, MemberAdress, MemberPincode, password')
          .eq('MemberPhNo', normalizedInput)
          .maybeSingle();
        memberData = data;
        memberError = error;
      }
      
      if (memberError) {
        logger.error('Supabase query error during member login');
        throw new Error('Error querying member');
      }
      
      if (!memberData) {
        throw new Error('Invalid credentials');
      }
      
      if (!memberData.password) {
        logger.error('No password found for member');
        throw new Error('Invalid credentials');
      }
      
      // Verify password using the edge function - this handles both hashed and legacy passwords
      logger.debug('Verifying password for member login');
      
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
        body: { 
          password: password,
          hashedPassword: memberData.password
        }
      });
      
      if (verifyError) {
        logger.error('Error verifying password for member:', verifyError);
        throw new Error('Invalid credentials');
      }
      
      if (!verifyResult?.isValid) {
        logger.debug('Password verification failed for member');
        throw new Error('Invalid credentials');
      }
      
      logger.debug('Member password verified successfully');
      
      // Login using the context function - fix: pass email and password with role
      const success = await login(memberData.MemberEmailId, password, 'member');
      
      if (success) {
        showToast("🎉 Login successful. Welcome back!", 'success', 4000);
        
        // Only navigate if shouldNavigate is true
        if (shouldNavigate) {
          navigate('/');
        }
      }

      return success;
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
