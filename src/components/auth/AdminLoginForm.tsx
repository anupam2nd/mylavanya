
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useLogin } from "@/hooks/useLogin";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPasswordSetup } from "./AdminPasswordSetup";
import AdminForgotPassword from "./AdminForgotPassword";

type LoginStep = "credentials" | "password" | "setup";

export default function AdminLoginForm() {
  const [currentStep, setCurrentStep] = useState<LoginStep>("credentials");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { handleLogin } = useLogin();

  const checkUserExistence = async () => {
    if (!emailOrPhone.trim()) {
      setErrorMessage("Please enter email or phone number");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const normalizedInput = emailOrPhone.trim().toLowerCase();
      
      // Check if it's email or phone
      const isEmail = normalizedInput.includes('@');
      
      let query = supabase.from('UserMST').select('*');
      
      if (isEmail) {
        query = query.ilike('email_id', normalizedInput);
      } else {
        // For phone number
        query = query.eq('PhoneNo', parseInt(normalizedInput));
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        setErrorMessage("Error checking user details");
        return;
      }

      if (!data) {
        setErrorMessage(isEmail ? "No user found with this email" : "No user found with this phone number");
        return;
      }

      // Check if user is active
      if (data.active === false) {
        setErrorMessage("Your account has been deactivated. Please contact support.");
        return;
      }

      // Check if user role is admin or controller
      if (!['admin', 'controller', 'superadmin'].includes(data.role)) {
        setErrorMessage("Access denied. This login is for admin and controller users only.");
        return;
      }

      setUserData(data);
      
      if (data.password) {
        setCurrentStep("password");
      } else {
        setCurrentStep("setup");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setErrorMessage("Please enter your password");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const success = await handleLogin({
        email: userData.email_id,
        password: password
      });
      
      if (!success) {
        setErrorMessage("Invalid password. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSetupComplete = () => {
    setCurrentStep("credentials");
    setEmailOrPhone("");
    setPassword("");
    setUserData(null);
    setErrorMessage("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetForm = () => {
    setCurrentStep("credentials");
    setEmailOrPhone("");
    setPassword("");
    setUserData(null);
    setErrorMessage("");
  };

  const handleForgotPasswordSuccess = (phone: string) => {
    setShowForgotPassword(false);
  };

  if (currentStep === "setup") {
    return (
      <AdminPasswordSetup 
        userData={userData}
        onComplete={handlePasswordSetupComplete}
        onBack={resetForm}
      />
    );
  }

  if (currentStep === "password") {
    return (
      <>
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground">
              This login is for admins, controllers & superadmin only. 
              Members should use the main sign in button.
            </p>
          </div>
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              value={userData?.email_id || emailOrPhone}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-login">Password</Label>
            <div className="relative">
              <Input 
                id="password-login" 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {/* Add forgot password link */}
          <div className="text-right">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm text-primary"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="flex-1"
            >
              Back
            </Button>
            <ButtonCustom 
              variant="primary-gradient" 
              className="flex-1"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Admin Sign In"}
            </ButtonCustom>
          </div>
        </form>

        <AdminForgotPassword
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handleForgotPasswordSuccess}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">
          This login is for admins, controllers & superadmin only. 
          Members should use the main sign in button.
        </p>
      </div>
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email-phone">Email or Phone Number</Label>
        <Input 
          id="email-phone" 
          type="text" 
          placeholder="Enter your email or phone number" 
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          required
        />
      </div>
      <ButtonCustom 
        variant="primary-gradient" 
        className="w-full"
        type="button"
        onClick={checkUserExistence}
        disabled={isLoading}
      >
        {isLoading ? "Checking..." : "Continue"}
      </ButtonCustom>
    </div>
  );
}
