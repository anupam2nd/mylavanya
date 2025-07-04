
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { registerFormSchema, RegisterFormValues } from "./RegisterFormSchema";
import { logger } from "@/utils/logger";
import { useCustomToast } from "@/context/ToastContext";

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
      // Convert email to lowercase for consistency
      const email = values.email.trim().toLowerCase();
      const phoneNumber = values.phoneNumber.trim();
      
      logger.debug("Starting member registration process");
      
      // Check if user already exists by email
      const { data: existingMembersByEmail, error: checkEmailError } = await supabase
        .from('MemberMST')
        .select('id')
        .ilike('MemberEmailId', email);
      
      if (checkEmailError) {
        logger.error('Error checking existing user by email');
        throw new Error('Error checking if user exists');
      }
      
      if (existingMembersByEmail && existingMembersByEmail.length > 0) {
        logger.debug("Member with this email already exists");
        throw new Error('An account with this email already exists');
      }
      
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
      
      // Hash the password using the edge function
      logger.debug("Hashing password for member registration");
      const { data: hashResult, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: values.password }
      });
      
      if (hashError) {
        logger.error('Error hashing password');
        throw new Error('Error processing password');
      }
      
      if (!hashResult?.hashedPassword) {
        logger.error('No hashed password returned from edge function');
        throw new Error('Error processing password');
      }
      
      logger.debug("Password hashed successfully, proceeding with member creation");
      
      // Format date for DB
      const formattedDate = values.dob ? format(values.dob, 'yyyy-MM-dd') : null;
      
      // Insert new member with hashed password and unique phone number
      const { data, error: insertError } = await supabase
        .from('MemberMST')
        .insert([
          { 
            MemberFirstName: values.firstName,
            MemberLastName: values.lastName,
            MemberEmailId: email,
            MemberPhNo: phoneNumber,
            MemberAdress: values.address,
            MemberPincode: values.pincode,
            MemberSex: values.sex,
            MemberDOB: formattedDate,
            password: hashResult.hashedPassword
          }
        ])
        .select();
      
      if (insertError) {
        logger.error('Error inserting new member');
        // Handle unique constraint violations more gracefully
        if (insertError.code === '23505') {
          if (insertError.message.includes('MemberPhNo')) {
            throw new Error('This phone number is already registered');
          } else if (insertError.message.includes('MemberEmailId')) {
            throw new Error('This email address is already registered');
          }
        }
        throw insertError;
      }
      
      logger.debug("Member registration completed successfully");
      
      // Show only one success toast
      showToast("🎉 Registration successful! Your account has been created. Please log in with your credentials.", 'success', 4000);
      
      // Pass credentials back to parent for auto-login
      onSuccess(email, values.password);
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
