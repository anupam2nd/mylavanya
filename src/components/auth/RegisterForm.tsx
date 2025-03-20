
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonCustom } from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface RegisterFormProps {
  onSuccess: (email: string, password: string) => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registerData, setRegisterData] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "" 
  });
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Convert email to lowercase for consistency
      const email = registerData.email.trim().toLowerCase();
      
      console.log("Attempting to register:", email);
      
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
        throw new Error('User already exists');
      }
      
      // Insert new user with default 'user' role
      const { data, error: insertError } = await supabase
        .from('UserMST')
        .insert([
          { 
            Username: email,
            password: registerData.password,
            role: 'user',
            FirstName: registerData.firstName, 
            LastName: registerData.lastName
          }
        ])
        .select();
      
      console.log("Insert result:", data, insertError);
      
      if (insertError) {
        console.error("Error inserting new user:", insertError);
        throw insertError;
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });
      
      // Pass credentials back to parent for auto-login
      onSuccess(email, registerData.password);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first-name">First Name</Label>
          <Input 
            id="first-name" 
            placeholder="First name" 
            value={registerData.firstName}
            onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Last Name</Label>
          <Input 
            id="last-name" 
            placeholder="Last name" 
            value={registerData.lastName}
            onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-register">Email</Label>
        <Input 
          id="email-register" 
          type="email" 
          placeholder="Your email address" 
          value={registerData.email}
          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-register">Password</Label>
        <Input 
          id="password-register" 
          type="password" 
          placeholder="Create a password" 
          value={registerData.password}
          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
          required
        />
      </div>
      <ButtonCustom 
        variant="primary-gradient" 
        className="w-full"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </ButtonCustom>
    </form>
  );
}
