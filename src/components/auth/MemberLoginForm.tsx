
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import ForgotPassword from "./ForgotPassword";
import { useMemberLogin } from "@/hooks/useMemberLogin";

interface MemberLoginFormProps {
  onLoginSuccess?: () => void;
}

export default function MemberLoginForm({ onLoginSuccess }: MemberLoginFormProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const { isLoading, handleLogin } = useMemberLogin();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleLogin(loginData, false); // Pass false to prevent navigation
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleForgotPasswordSuccess = (email: string) => {
    // Pre-fill the email field after password reset
    setLoginData(prev => ({ ...prev, email }));
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-login">Email</Label>
          <Input 
            id="email-login" 
            type="email" 
            placeholder="Your email address" 
            value={loginData.email}
            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
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
              onClick={() => setForgotPasswordOpen(true)}
            >
              Forgot password?
            </Button>
          </div>
          <Input 
            id="password-login" 
            type="password" 
            placeholder="Your password" 
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            required
          />
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

      {/* Forgot Password Dialog */}
      <ForgotPassword 
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onSuccess={handleForgotPasswordSuccess}
      />
    </>
  );
}
