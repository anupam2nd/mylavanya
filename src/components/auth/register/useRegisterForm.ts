
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
  address: string;
  pincode: string;
  sex: string;
  dob: Date;
}

interface UseRegisterFormProps {
  onSuccess: (email: string, password: string) => void;
}

export const useRegisterForm = ({ onSuccess }: UseRegisterFormProps) => {
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

      // Store user data in MemberMST table
      const { data, error: insertError } = await supabase
        .from('MemberMST')
        .insert([
          {
            MemberEmailId: values.email,
            MemberFirstName: values.firstName,
            MemberLastName: values.lastName,
            password: hashedPassword,
            MemberPhNo: values.phone,
            MemberAdress: values.address,
            MemberPincode: values.pincode,
            MemberSex: values.sex,
            MemberDOB: values.dob.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            MemberStatus: true
          }
        ])
        .select();

      if (insertError) {
        console.error('Database insertion error:', insertError);
        throw new Error(insertError.message || 'Failed to create account');
      }

      console.log('Registration successful:', data);
      toast.success("Registration successful!");
      onSuccess(values.email, values.password);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
  };
};
