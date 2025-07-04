
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
import { logger } from "@/utils/logger";

interface MemberSignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  pincode: string;
  sex: string;
  dob: Date;
}

interface MemberSignInData {
  email: string;
  password: string;
}

export function useSupabaseMemberAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useCustomToast();

  const signUp = async (data: MemberSignUpData) => {
    setIsLoading(true);
    
    try {
      logger.debug("Starting Supabase member signup process");
      
      // Check if email already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(data.email);
      if (existingUser.user) {
        throw new Error('An account with this email already exists');
      }

      // Sign up with Supabase auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            userType: 'member',
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            address: data.address,
            pincode: data.pincode,
            sex: data.sex,
            dob: data.dob.toISOString().split('T')[0] // Format as YYYY-MM-DD
          }
        }
      });

      if (signUpError) {
        logger.error('Supabase signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      logger.debug("Member signup successful with Supabase auth");
      
      showToast("🎉 Registration successful! Please check your email to verify your account before signing in.", 'success', 6000);
      
      return { success: true, user: authData.user };
    } catch (error: any) {
      logger.error('Member signup failed:', error);
      showToast("❌ Registration failed: " + (error.message || "Something went wrong. Please try again."), 'error', 4000);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async ({ email, password }: MemberSignInData) => {
    setIsLoading(true);
    
    try {
      logger.debug("Starting Supabase member signin process");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Supabase signin error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('Sign in failed');
      }

      // Check if user has confirmed their email
      if (!data.user.email_confirmed_at) {
        throw new Error('Please verify your email address before signing in. Check your inbox for a verification email.');
      }

      logger.debug("Member signin successful with Supabase auth");
      
      showToast("🎉 Login successful. Welcome back!", 'success', 4000);
      
      return { success: true, user: data.user, session: data.session };
    } catch (error: any) {
      logger.error('Member signin failed:', error);
      showToast("❌ " + (error.message || "Invalid email or password. Please try again."), 'error', 4000);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      showToast("👋 Signed out successfully", 'success', 3000);
      navigate('/');
    } catch (error: any) {
      logger.error('Sign out failed:', error);
      showToast("❌ Sign out failed: " + error.message, 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      showToast("📧 Password reset email sent. Please check your inbox.", 'success', 5000);
      return { success: true };
    } catch (error: any) {
      logger.error('Password reset failed:', error);
      showToast("❌ Password reset failed: " + error.message, 'error', 4000);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}
