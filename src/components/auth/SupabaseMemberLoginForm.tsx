
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useMemberLogin } from "@/hooks/useMemberLogin";
import { useCustomToast } from "@/context/ToastContext";
import { Eye, EyeOff } from "lucide-react";

interface SupabaseMemberLoginFormProps {
  onLoginSuccess?: () => void;
}

export default function SupabaseMemberLoginForm({ onLoginSuccess }: SupabaseMemberLoginFormProps) {
  const [loginData, setLoginData] = useState({ emailOrPhone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, handleLogin } = useMemberLogin();
  const { showToast } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleLogin(loginData, false); // Pass false to prevent navigation
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleForgotPassword = async () => {
    if (!loginData.emailOrPhone) {
      showToast("Please enter your email or phone number first", 'error');
      return;
    }

    // Only handle forgot password for email addresses
    const isEmail = loginData.emailOrPhone.includes('@');
    if (!isEmail) {
      showToast("Password reset is only available for email addresses. Please enter your email.", 'error');
      return;
    }

    // For now, show a message that this feature is not yet implemented for Supabase members
    showToast("Password reset for email addresses will be available soon. Please contact support if needed.", 'info');
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
