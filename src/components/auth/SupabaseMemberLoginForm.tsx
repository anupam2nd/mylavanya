
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useSupabaseMemberAuth } from "@/hooks/useSupabaseMemberAuth";
import { Eye, EyeOff } from "lucide-react";

interface SupabaseMemberLoginFormProps {
  onLoginSuccess?: () => void;
}

export default function SupabaseMemberLoginForm({ onLoginSuccess }: SupabaseMemberLoginFormProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { isLoading, signIn, resetPassword } = useSupabaseMemberAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(loginData);
    if (result.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    const result = await resetPassword(resetEmail);
    if (result.success) {
      setShowForgotPassword(false);
      setResetEmail("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (showForgotPassword) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium">Reset Password</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>
        
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email Address</Label>
            <Input 
              id="reset-email" 
              type="email" 
              placeholder="Enter your email address" 
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              className="flex-1"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </Button>
            <ButtonCustom 
              variant="primary-gradient" 
              className="flex-1"
              type="submit"
              disabled={isLoading || !resetEmail}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </ButtonCustom>
          </div>
        </form>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-login">Email Address</Label>
        <Input 
          id="email-login" 
          type="email" 
          placeholder="Enter your email address" 
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
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot password?
          </Button>
        </div>
        <div className="relative">
          <Input 
            id="password-login" 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter your password" 
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
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
