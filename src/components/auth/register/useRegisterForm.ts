
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { RegisterFormValues } from "./RegisterFormSchema";

interface RegisterFormSubmitValues {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  userType: string;
}

export const useRegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: RegisterFormSubmitValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Hash the password before sending to backend
      const response = await fetch('/api/hash-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: values.password }),
      });

      if (!response.ok) {
        throw new Error('Failed to hash password');
      }

      const { hashedPassword } = await response.json();

      // Store user data
      const { data, error: insertError } = await supabase
        .from('UserMST')
        .insert([
          {
            Username: values.email,
            FirstName: values.firstName,
            LastName: values.lastName,
            password: hashedPassword,
            Phone_no: parseInt(values.phone, 10),
            role: values.userType,
            CreatedDate: new Date().toISOString(),
            Active: true
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      toast("Registration successful!");
      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSuccess = () => {
    // Handle successful registration
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
  };
};
