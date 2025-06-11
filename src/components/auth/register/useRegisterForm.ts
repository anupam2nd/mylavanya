
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
      const phoneNumber = values.phoneNumber.trim();
      
      console.log("Attempting to register:", email, phoneNumber);
      
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
      
      // Check if phone number is already registered with enhanced uniqueness check
      const { data: existingMembersByPhone, error: checkPhoneError } = await supabase
        .from('MemberMST')
        .select('id, MemberEmailId')
        .eq('MemberPhNo', phoneNumber);
      
      if (checkPhoneError) {
        console.error("Error checking existing user by phone:", checkPhoneError);
        throw new Error('Error checking if phone number exists');
      }
      
      if (existingMembersByPhone && existingMembersByPhone.length > 0) {
        console.log("Member with this phone already exists:", existingMembersByPhone);
        throw new Error(`This phone number is already registered with email: ${existingMembersByPhone[0].MemberEmailId}`);
      }
      
      // Hash the password using the edge function
      console.log("Hashing password...");
      const { data: hashResult, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: values.password }
      });
      
      if (hashError) {
        console.error("Error hashing password:", hashError);
        throw new Error('Error processing password');
      }
      
      if (!hashResult?.hashedPassword) {
        console.error("No hashed password returned");
        throw new Error('Error processing password');
      }
      
      console.log("Password hashed successfully");
      
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
      
      console.log("Insert result:", data, insertError);
      
      if (insertError) {
        console.error("Error inserting new member:", insertError);
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
      
      toast.success("Registration successful", {
        description: "Your account has been created. You can now log in with your email or phone number.",
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
