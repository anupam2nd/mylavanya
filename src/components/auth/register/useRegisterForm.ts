
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
  onSuccess: (phone: string, password: string) => void;
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
      
      logger.debug("Starting member registration process with synthetic email strategy");
      
      // Check if phone number is already registered
      const { data: existingMembersByPhone, error: checkPhoneError } = await supabase
        .from('MemberMST')
        .select('id, MemberEmailId, MemberPhNo')
        .eq('MemberPhNo', phoneNumber);
      
      if (checkPhoneError) {
        logger.error('Error checking existing user by phone');
        throw new Error('Error checking if phone number exists');
      }
      
      if (existingMembersByPhone && existingMembersByPhone.length > 0) {
        logger.debug("Member with this phone already exists");
        throw new Error(`This phone number is already registered`);
      }
      
      // Check if email is provided and already exists
      if (email) {
        const { data: existingMembersByEmail, error: checkEmailError } = await supabase
          .from('MemberMST')
          .select('id, MemberPhNo')
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
      
      // Determine email for Supabase auth
      const authEmail = email || generateSyntheticEmail(phoneNumber);
      const syntheticEmail = email ? null : authEmail;
      
      logger.debug("Using email for Supabase auth:", authEmail);
      
      // Use Supabase email authentication (with real or synthetic email)
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: values.password,
        options: {
          data: {
            userType: 'member',
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: phoneNumber,
            email: email || null,
            sex: values.sex,
            dob: values.dob ? format(values.dob, 'yyyy-MM-dd') : null,
            address: values.address,
            pincode: values.pincode,
          }
        }
      });

      if (error) {
        logger.error('Supabase auth registration failed:', error);
        throw error;
      }

      if (data.user) {
        logger.debug("Email auth registration successful, now creating member record");
        
        // Hash password using edge function
        const { data: hashedPasswordData, error: hashError } = await supabase.functions.invoke('hash-password', {
          body: { password: values.password }
        });

        if (hashError || !hashedPasswordData?.hashedPassword) {
          logger.error('Error hashing password:', hashError);
          throw new Error('Failed to process password');
        }

        // Create member record in MemberMST table with same UUID
        const { error: memberError } = await supabase
          .from('MemberMST')
          .insert({
            uuid: data.user.id,
            MemberFirstName: values.firstName,
            MemberLastName: values.lastName,
            MemberPhNo: phoneNumber,
            MemberEmailId: email || null,
            synthetic_email: syntheticEmail,
            MemberSex: values.sex,
            MemberDOB: values.dob ? format(values.dob, 'yyyy-MM-dd') : null,
            MemberAdress: values.address,
            MemberPincode: values.pincode,
            password: hashedPasswordData.hashedPassword,
            MemberStatus: true,
            MaritalStatus: false,
            HasChildren: false,
            NumberOfChildren: 0,
            ChildrenDetails: []
          });

        if (memberError) {
          logger.error('Error creating member record:', memberError);
          throw new Error('Failed to create member profile');
        }
        
        logger.debug("Member registration completed successfully");
        showToast("🎉 Registration successful! You can now sign in with your credentials.", 'success', 5000);
        
        // Pass the auth email (real or synthetic) for login
        onSuccess(authEmail, values.password);
      }
    } catch (error: any) {
      logger.error('Member registration failed:', error);
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
