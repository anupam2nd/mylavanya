import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  onSuccess: (email: string, password: string) => void;
  userType?: string;
}

export default function RegisterForm({ onSuccess, userType = "member" }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registerData, setRegisterData] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    pincode: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if passwords match
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please ensure your passwords match.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert email to lowercase for consistency
      const email = registerData.email.trim().toLowerCase();
      
      console.log(`Attempting to register ${userType}:`, email);
      
      // Hash password using the edge function
      const { data: hashData, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: registerData.password }
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
          throw new Error('User already exists');
        }
        
        // Insert new member with hashed password
        const { data, error: insertError } = await supabase
          .from('MemberMST')
          .insert([
            { 
              MemberEmailId: email,
              password: hashedPassword,
              MemberFirstName: registerData.firstName, 
              MemberLastName: registerData.lastName,
              MemberPhNo: registerData.phone,
              MemberAdress: registerData.address,
              MemberPincode: registerData.pincode
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
          throw new Error('User already exists');
        }
        
        // Insert new user with hashed password
        const { data, error: insertError } = await supabase
          .from('UserMST')
          .insert([
            { 
              Username: email,
              password: hashedPassword,
              FirstName: registerData.firstName, 
              LastName: registerData.lastName,
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
    <>
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
          <Label htmlFor="email-register">
            Email <span className="text-xs text-muted-foreground">(This will be your login ID)</span>
          </Label>
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
          <div className="relative">
            <Input 
              id="password-register" 
              type={showPassword ? "text" : "password"}
              placeholder="Create a password" 
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 h-full px-3"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input 
              id="confirm-password" 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password" 
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 top-0 h-full px-3"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showConfirmPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </div>
        
        {userType === "member" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Your phone number" 
                value={registerData.phone}
                onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                placeholder="Your address" 
                value={registerData.address}
                onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input 
                id="pincode" 
                placeholder="Your pincode" 
                value={registerData.pincode}
                onChange={(e) => setRegisterData({...registerData, pincode: e.target.value})}
                required
              />
            </div>
          </>
        )}
        
        <ButtonCustom 
          variant="primary-gradient" 
          className="w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </ButtonCustom>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button 
            type="button" 
            variant="link" 
            className="p-0 h-auto"
            onClick={() => window.dispatchEvent(new CustomEvent('switchToLogin'))}
          >
            Sign in
          </Button>
        </p>
      </div>
    </>
  );
}
