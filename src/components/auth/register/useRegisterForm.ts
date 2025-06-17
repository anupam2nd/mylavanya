import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegisterFormValues {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  userType: string;
}

export const useRegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (values: RegisterFormValues) => {
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
            Password: hashedPassword,
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

      toast.success("Registration successful!");
      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSuccess = () => {
    // Handle successful registration, e.g., redirect or show a success message
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
  };
};
