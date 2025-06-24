
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
      
      // Verify password using the edge function
      logger.debug('Verifying password...');
      
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
        body: { 
          password: password,
          hashedPassword: memberData.password
        }
      });
      
      if (verifyError) {
        logger.error('Error verifying password');
        throw new Error('Invalid credentials');
      }
      
      if (!verifyResult?.isValid) {
        logger.debug('Password verification failed');
        throw new Error('Invalid credentials');
      }
      
      logger.debug('Password verified successfully');
      
      login({
        id: memberData.id.toString(),
        email: memberData.MemberEmailId,
        role: 'member',
        firstName: memberData.MemberFirstName,
        lastName: memberData.MemberLastName
      });
      
      toast.success("Login successful. Welcome back!");
      
      // Only navigate if shouldNavigate is true
      if (shouldNavigate) {
        navigate('/');
      }

      return true;
    } catch (error) {
      logger.error('Member login failed');
      toast.error(error instanceof Error ? error.message : "Invalid email/phone or password. Please try again.");
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
