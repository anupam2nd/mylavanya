
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";
import { toast } from "sonner";

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
        toast.error('Please enter a valid email address or 10-digit phone number');
        return false;
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
        toast.error('Error querying member');
        return false;
      }
      
      if (!memberData) {
        toast.error('Invalid credentials');
        return false;
      }
      
      if (!memberData.password) {
        toast.error('Invalid credentials');
        return false;
      }
      
      // Verify password using the edge function - this handles both hashed and legacy passwords
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
        body: { 
          password: password,
          hashedPassword: memberData.password
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
      
      login({
        id: memberData.id.toString(),
        email: memberData.MemberEmailId,
        role: 'member',
        firstName: memberData.MemberFirstName,
        lastName: memberData.MemberLastName
      });
      
      toast.success('Login successful! Welcome back.');
      
      // Only navigate if shouldNavigate is true
      if (shouldNavigate) {
        navigate('/');
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
