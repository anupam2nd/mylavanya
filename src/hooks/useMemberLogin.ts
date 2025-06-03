
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface MemberLoginCredentials {
  email: string;
  password: string;
}

export function useMemberLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async ({ email, password }: MemberLoginCredentials, shouldNavigate: boolean = true) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting member login with:", email);
      const normalizedEmail = email.trim().toLowerCase();
      
      // Get member data by email
      const { data: memberData, error: memberError } = await supabase
        .from('MemberMST')
        .select('id, MemberFirstName, MemberLastName, MemberEmailId, MemberPhNo, MemberAdress, MemberPincode, password')
        .ilike('MemberEmailId', normalizedEmail)
        .maybeSingle();
      
      console.log("Member query result:", memberData, memberError);
      
      if (memberError) {
        console.error("Supabase query error:", memberError);
        throw new Error('Error querying member');
      }
      
      if (!memberData) {
        throw new Error('Invalid credentials');
      }
      
      // Verify password using the edge function
      console.log("Verifying password...");
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
        body: { 
          password: password,
          hashedPassword: memberData.password
        }
      });
      
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
      toast.error("Invalid email or password. Please try again.");
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
