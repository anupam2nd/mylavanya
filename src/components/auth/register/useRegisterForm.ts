
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  pincode: string;
}

interface UseRegisterFormProps {
  userType: string;
  onSuccess: (email: string, password: string) => void;
}

export function useRegisterForm({ userType, onSuccess }: UseRegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    pincode: ""
  });

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match. Please ensure your passwords match.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert email to lowercase for consistency
      const email = formData.email.trim().toLowerCase();
      
      console.log(`Attempting to register ${userType}:`, email);
      
      // Hash password using the edge function
      const { data: hashData, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: formData.password }
      });

      if (hashError) {
        console.error("Error hashing password:", hashError);
        throw new Error('Error securing password');
      }

      const hashedPassword = hashData.hashedPassword;
      
      if (userType === "member") {
        // Check if member already exists
        const { data: existingMembers, error: checkError } = await supabase
          .from('MemberMST')
          .select('MemberEmailId')
          .ilike('MemberEmailId', email);
        
        console.log("Check for existing member:", existingMembers, checkError);
        
        if (checkError) {
          console.error("Error checking existing member:", checkError);
          throw new Error('Error checking if member exists');
        }
        
        if (existingMembers && existingMembers.length > 0) {
          console.log("Member already exists:", existingMembers);
          throw new Error('Email already registered. Please login instead.');
        }
        
        // Insert new member with hashed password
        const { data, error: insertError } = await supabase
          .from('MemberMST')
          .insert([
            { 
              MemberEmailId: email,
              password: hashedPassword,
              MemberFirstName: formData.firstName, 
              MemberLastName: formData.lastName,
              MemberPhNo: formData.phone,
              MemberAdress: formData.address,
              MemberPincode: formData.pincode
            }
          ])
          .select();
        
        console.log("Insert result:", data, insertError);
        
        if (insertError) {
          console.error("Error inserting new member:", insertError);
          throw insertError;
        }
      } else {
        // For non-member users (admin, artist)
        // Check if user already exists
        const { data: existingUsers, error: checkError } = await supabase
          .from('UserMST')
          .select('Username')
          .ilike('Username', email);
        
        console.log("Check for existing user:", existingUsers, checkError);
        
        if (checkError) {
          console.error("Error checking existing user:", checkError);
          throw new Error('Error checking if user exists');
        }
        
        if (existingUsers && existingUsers.length > 0) {
          console.log("User already exists:", existingUsers);
          throw new Error('Email already registered. Please login instead.');
        }
        
        // Insert new user with hashed password
        const { data, error: insertError } = await supabase
          .from('UserMST')
          .insert([
            { 
              Username: email,
              password: hashedPassword,
              FirstName: formData.firstName, 
              LastName: formData.lastName,
              role: userType === "artist" ? "artist" : "admin"
            }
          ])
          .select();
        
        console.log("Insert result:", data, insertError);
        
        if (insertError) {
          console.error("Error inserting new user:", insertError);
          throw insertError;
        }
      }
      
      toast.success("Registration successful! You can now log in.");
      
      // Pass credentials back to parent for auto-login
      onSuccess(email, formData.password);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    updateField,
    handleRegister
  };
}
