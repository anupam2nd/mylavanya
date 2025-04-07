
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import ForgotPassword from "./ForgotPassword";
import { useLogin } from "@/hooks/useLogin";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, handleLogin } = useLogin();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleLogin(loginData);
    
    if (success) {
      window.dispatchEvent(new CustomEvent('closeAuthModal'));
    }
  };

  const handleForgotPasswordSuccess = (email: string) => {
    // Pre-fill the email field after password reset
    setLoginData(prev => ({ ...prev, email }));
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <div className="relative">
            <Input 
              id="password-login" 
              type={showPassword ? "text" : "password"}
              placeholder="Your password" 
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={togglePasswordVisibility}
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
        <ButtonCustom 
          variant="primary-gradient" 
          className="w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </ButtonCustom>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button 
            type="button" 
            variant="link" 
            className="p-0 h-auto"
            onClick={() => {
              // Trigger tab change in parent component
              window.dispatchEvent(new CustomEvent('switchToRegister', { 
                detail: { role: 'admin' } 
              }));
            }}
          >
            Register here
          </Button>
        </p>
      </div>

      {/* Forgot Password Dialog */}
      <ForgotPassword 
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onSuccess={handleForgotPasswordSuccess}
      />
    </>
  );
}
