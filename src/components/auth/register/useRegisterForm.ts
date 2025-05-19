
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { registerFormSchema, RegisterFormValues } from "./RegisterFormSchema";

interface UseRegisterFormProps {
  onSuccess: (email: string, password: string) => void;
}

export function useRegisterForm({ onSuccess }: UseRegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
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
      toast.error("Please verify your phone number before registering");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert email to lowercase for consistency
      const email = values.email.trim().toLowerCase();
      
      console.log("Attempting to register:", email);
      
      // Check if user already exists by email
      const { data: existingMembersByEmail, error: checkEmailError } = await supabase
        .from('MemberMST')
        .select('id')
        .ilike('MemberEmailId', email);
      
      if (checkEmailError) {
        console.error("Error checking existing user by email:", checkEmailError);
        throw new Error('Error checking if user exists');
      }
      
      if (existingMembersByEmail && existingMembersByEmail.length > 0) {
        console.log("Member with this email already exists:", existingMembersByEmail);
        throw new Error('An account with this email already exists');
      }
      
      // Check if phone number is already registered (double check)
      const { data: existingMembersByPhone, error: checkPhoneError } = await supabase
        .from('MemberMST')
        .select('id')
        .eq('MemberPhNo', values.phoneNumber);
      
      if (checkPhoneError) {
        console.error("Error checking existing user by phone:", checkPhoneError);
        throw new Error('Error checking if phone number exists');
      }
      
      if (existingMembersByPhone && existingMembersByPhone.length > 0) {
        console.log("Member with this phone already exists:", existingMembersByPhone);
        throw new Error('An account with this phone number already exists');
      }
      
      // Format date for DB
      const formattedDate = values.dob ? format(values.dob, 'yyyy-MM-dd') : null;
      
      // Insert new member
      const { data, error: insertError } = await supabase
        .from('MemberMST')
        .insert([
          { 
            MemberFirstName: values.firstName,
            MemberLastName: values.lastName,
            MemberEmailId: email,
            MemberPhNo: values.phoneNumber,
            MemberAdress: values.address,
            MemberPincode: values.pincode,
            MemberSex: values.sex,
            MemberDOB: formattedDate,
            password: values.password
          }
        ])
        .select();
      
      console.log("Insert result:", data, insertError);
      
      if (insertError) {
        console.error("Error inserting new member:", insertError);
        throw insertError;
      }
      
      toast.success("Registration successful", {
        description: "Your account has been created. You can now log in.",
      });
      
      // Pass credentials back to parent for auto-login
      onSuccess(email, values.password);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error("Registration failed", {
        description: error.message || "Something went wrong. Please try again.",
      });
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
