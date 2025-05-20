
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import ForgotPassword from "./ForgotPassword";
import { useLogin } from "@/hooks/useLogin";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, handleLogin } = useLogin();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(loginData);
  };

  const handleForgotPasswordSuccess = (phone: string) => {
    // Currently we don't have a way to auto-fill by phone number since the form uses email
    // But we can show a success message
    toast.info("Password reset successful. Please login with your new password.");
    setForgotPasswordOpen(false);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4 text-center">
          <p className="text-sm text-muted-foreground">
            This login is for admins, controllers & superadmin only. 
            Members should use the main sign in button.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-login">Email</Label>
          <Input 
            id="email-login" 
            type="email" 
            placeholder="Your admin email address" 
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
          {isLoading ? "Signing in..." : "Admin Sign In"}
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
