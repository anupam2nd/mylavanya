
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { registerFormSchema, RegisterFormValues } from "./RegisterFormSchema";
import { logger } from "@/utils/logger";
import { useCustomToast } from "@/context/ToastContext";
import { generateSyntheticEmail } from "@/utils/syntheticEmail";

interface UseRegisterFormProps {
  onSuccess: (email: string, password: string) => void;
}

export function useRegisterForm({ onSuccess }: UseRegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useCustomToast();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      pincode: "",
      sex: "Male",
      dob: undefined,
      password: "",
      confirmPassword: "",
      isPhoneVerified: false,
    },
  });
  
  const handleRegister = async (values: RegisterFormValues) => {
    // Ensure phone is verified
    if (!values.isPhoneVerified) {
      showToast("❌ Please verify your phone number before registering", 'error', 4000);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const phoneNumber = values.phoneNumber.trim();
      const email = values.email?.trim() || "";
      
      logger.debug("Starting member registration process");
      
      // Check if phone number is already registered with enhanced uniqueness check
      const { data: existingMembersByPhone, error: checkPhoneError } = await supabase
        .from('MemberMST')
        .select('id, MemberEmailId')
        .eq('MemberPhNo', phoneNumber);
      
      if (checkPhoneError) {
        logger.error('Error checking existing user by phone');
        throw new Error('Error checking if phone number exists');
      }
      
      if (existingMembersByPhone && existingMembersByPhone.length > 0) {
        logger.debug("Member with this phone already exists");
        throw new Error(`This phone number is already registered with email: ${existingMembersByPhone[0].MemberEmailId}`);
      }
      
      // Check if email is provided and already exists
      if (email) {
        const { data: existingMembersByEmail, error: checkEmailError } = await supabase
          .from('MemberMST')
          .select('id')
          .ilike('MemberEmailId', email);
        
        if (checkEmailError) {
          logger.error('Error checking existing user by email');
          throw new Error('Error checking if email exists');
        }
        
        if (existingMembersByEmail && existingMembersByEmail.length > 0) {
          logger.debug("Member with this email already exists");
          throw new Error('An account with this email already exists');
        }
      }
      
      // Generate synthetic email for phone-based registration
      const syntheticEmail = generateSyntheticEmail(phoneNumber);
      
      // Use synthetic email for Supabase auth registration
      const { data, error } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            userType: 'member',
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: phoneNumber,
            originalPhone: phoneNumber,
            email: email || null,
            sex: values.sex,
            dob: values.dob ? format(values.dob, 'yyyy-MM-dd') : null,
            address: values.address,
            pincode: values.pincode,
            isPhoneRegistration: true
          }
        }
      });

      if (error) {
        logger.error('Supabase auth registration failed');
        throw error;
      }

      if (data.user) {
        logger.debug("Member registration completed successfully");
        showToast("🎉 Registration successful! Your account has been created. You can now sign in with your phone number.", 'success', 4000);
        
        // Pass synthetic email for auto-login
        onSuccess(syntheticEmail, values.password);
      }
    } catch (error: any) {
      logger.error('Member registration failed');
      showToast("❌ Registration failed: " + (error.message || "Something went wrong. Please try again."), 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    form,
    isLoading,
    handleRegister,
  };
}
