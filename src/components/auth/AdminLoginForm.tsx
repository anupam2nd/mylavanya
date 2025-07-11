import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useLogin } from "@/hooks/useLogin";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
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
  const { handleLogin } = useLogin();
  const { showToast } = useCustomToast();
  const navigate = useNavigate();

  const checkUserExistence = async () => {
    if (!emailOrPhone.trim()) {
      showToast("❌ Please enter email or phone number", 'error', 4000);
      return;
    }

    console.log('Starting user existence check - potential layout shift point');
    setIsLoading(true);
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
        console.error("Error checking user:", error);
        showToast("❌ Error checking user details", 'error', 4000);
        return;
      }

      if (!data) {
        showToast(isEmail ? "❌ No user found with this email" : "❌ No user found with this phone number", 'error', 4000);
        return;
      }

      // Check if user is active
      if (data.active === false) {
        showToast("❌ Your account has been deactivated. Please contact support.", 'error', 4000);
        return;
      }

      // Check if user role is admin or controller
      if (!['admin', 'controller', 'superadmin'].includes(data.role)) {
        showToast("❌ Access denied. This login is for admin and controller users only.", 'error', 4000);
        return;
      }

      console.log('User data found, setting state - potential layout shift point');
      setUserData(data);
      
      if (data.password) {
        setCurrentStep("password");
      } else {
        setCurrentStep("setup");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("❌ Something went wrong. Please try again.", 'error', 4000);
    } finally {
      console.log('User existence check finished');
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      showToast("❌ Please enter your password", 'error', 4000);
      return;
    }

    console.log('Starting password login - potential layout shift point');
    setIsLoading(true);
    try {
      // Check if user has been migrated to Supabase Auth (has uuid)
      if (userData.uuid) {
        // Use Supabase Auth login for migrated users
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userData.email_id,
          password: password
        });

        if (error) {
          throw new Error('Invalid email or password');
        }

        if (data.user) {
          showToast(`🎉 Login successful. Welcome back! You are now logged in as ${userData.role}.`, 'success', 4000);
          
          // Redirect based on role
          if (userData.role === 'superadmin' || userData.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (userData.role === 'controller') {
            navigate('/controller/dashboard');
          }
        }
      } else {
        // Use legacy login for users not yet migrated
        await handleLogin({
          email: userData.email_id,
          password: password
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("❌ Invalid email or password. Please try again.", 'error', 4000);
    } finally {
      console.log('Password login finished');
      setIsLoading(false);
    }
  };

  const handlePasswordSetupComplete = () => {
    showToast("🎉 Password set successfully! Please login again with your credentials.", 'success', 4000);
    setCurrentStep("credentials");
    setEmailOrPhone("");
    setPassword("");
    setUserData(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetForm = () => {
    setCurrentStep("credentials");
    setEmailOrPhone("");
    setPassword("");
    setUserData(null);
  };

  const handleForgotPasswordSuccess = (phone: string) => {
    setShowForgotPassword(false);
    showToast("🎉 Password reset successfully! You can now login with your new password.", 'success', 4000);
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
