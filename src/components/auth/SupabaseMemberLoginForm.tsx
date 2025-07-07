
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useCustomToast } from "@/context/ToastContext";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { convertToAuthFormat, isPhoneInput, isEmailInput } from "@/utils/syntheticEmail";

interface SupabaseMemberLoginFormProps {
  onLoginSuccess?: () => void;
}

export default function SupabaseMemberLoginForm({ onLoginSuccess }: SupabaseMemberLoginFormProps) {
  const [loginData, setLoginData] = useState({ emailOrPhone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { emailOrPhone, password } = loginData;
    
    if (!emailOrPhone || !password) {
      showToast("Please enter both email/phone and password", 'error');
      return;
    }

    // Validate input format
    const isEmail = isEmailInput(emailOrPhone);
    const isPhone = isPhoneInput(emailOrPhone);
    
    if (!isEmail && !isPhone) {
      showToast("Please enter a valid email address or 10-digit phone number", 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Convert phone number to synthetic email if needed
      const authEmail = convertToAuthFormat(emailOrPhone);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        showToast("🎉 Login successful. Welcome back!", 'success', 4000);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      showToast("❌ Invalid credentials. Please check your email/phone and password.", 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginData.emailOrPhone) {
      showToast("Please enter your email or phone number first", 'error');
      return;
    }

    // Only handle forgot password for email addresses
    const isEmail = isEmailInput(loginData.emailOrPhone);
    if (!isEmail) {
      showToast("Password reset is only available for email addresses. Please enter your email.", 'error');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginData.emailOrPhone, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      showToast("Password reset email sent. Please check your inbox.", 'success');
    } catch (error: any) {
      console.error('Password reset error:', error);
      showToast("Failed to send password reset email. Please try again.", 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="emailOrPhone-login">Email or Phone Number</Label>
        <Input
          id="emailOrPhone-login"
          type="text"
          placeholder="Your email or 10-digit phone number"
          value={loginData.emailOrPhone}
          onChange={(e) => setLoginData({ ...loginData, emailOrPhone: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password-login">Password</Label>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-xs"
            onClick={handleForgotPassword}
          >
            Forgot password?
          </Button>
        </div>
        <div className="relative">
          <Input
            id="password-login"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      <ButtonCustom
        variant="primary-gradient"
        className="w-full"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </ButtonCustom>
    </form>
  );
}
