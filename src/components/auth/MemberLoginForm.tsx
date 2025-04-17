
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useMemberLogin } from "@/hooks/useMemberLogin";
import { Eye, EyeOff } from "lucide-react";

export default function MemberLoginForm() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, handleLogin } = useMemberLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting member login form", loginData);
    const success = await handleLogin(loginData);
    
    // If login was successful, close the modal by dispatching a custom event
    if (success) {
      window.dispatchEvent(new CustomEvent('closeAuthModal'));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Your email address"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
                detail: { role: 'member' } 
              }));
            }}
          >
            Register here
          </Button>
        </p>
      </div>
    </>
  );
}
