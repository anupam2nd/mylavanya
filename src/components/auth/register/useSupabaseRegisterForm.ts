
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, RegisterFormValues } from "./RegisterFormSchema";
import { useSupabaseMemberAuth } from "@/hooks/useSupabaseMemberAuth";
import { useCustomToast } from "@/context/ToastContext";

interface UseSupabaseRegisterFormProps {
  onSuccess: () => void;
}

export function useSupabaseRegisterForm({ onSuccess }: UseSupabaseRegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useSupabaseMemberAuth();
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
      const result = await signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber.trim(),
        address: values.address,
        pincode: values.pincode,
        sex: values.sex,
        dob: values.dob,
      });

      if (result.success) {
        onSuccess();
      }
    } catch (error: any) {
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
