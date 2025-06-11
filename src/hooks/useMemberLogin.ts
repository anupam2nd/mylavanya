
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

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
      console.log("Attempting member login with:", emailOrPhone);
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
      
      console.log("Member query result:", memberData, memberError);
      
      if (memberError) {
        console.error("Supabase query error:", memberError);
        throw new Error('Error querying member');
      }
      
      if (!memberData) {
        throw new Error('Invalid credentials');
      }
      
      if (!memberData.password) {
        console.error("No password found for member");
        throw new Error('Invalid credentials');
      }
      
      // Verify password using the edge function
      console.log("Verifying password...");
      console.log("Stored hash preview:", memberData.password.substring(0, 10) + "...");
      
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
        body: { 
          password: password,
          hashedPassword: memberData.password
        }
      });
      
      console.log("Verify function response:", verifyResult, verifyError);
      
      if (verifyError) {
        console.error("Error verifying password:", verifyError);
        throw new Error('Invalid credentials');
      }
      
      if (!verifyResult?.isValid) {
        console.log("Password verification failed");
        throw new Error('Invalid credentials');
      }
      
      console.log("Password verified successfully");
      
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
      console.error('Member login error:', error);
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
