
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

  const handleLogin = async ({ email, password }: MemberLoginCredentials) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting member login with:", email);
      // Explicitly convert email to lowercase for consistent matching
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('MemberMST')
        .select('id, MemberFirstName, MemberLastName, MemberEmailId, MemberPhNo, MemberAdress, MemberPincode')
        .ilike('MemberEmailId', normalizedEmail)
        .eq('password', password)
        .maybeSingle();
      
      console.log("Member query result:", data, error);
      
      if (error) {
        console.error("Supabase query error:", error);
        throw new Error('Error querying member');
      }
      
      if (!data) {
        throw new Error('Invalid credentials');
      }
      
      // Login using the context function
      login({
        id: data.id.toString(),
        email: data.MemberEmailId,
        role: 'member',
        firstName: data.MemberFirstName,
        lastName: data.MemberLastName
      });
      
      toast.success("Login successful. Welcome back!");
      
      // Redirect to home page
      navigate('/');

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
