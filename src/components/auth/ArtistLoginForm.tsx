import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useArtistLogin } from "@/hooks/useArtistLogin";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArtistPasswordSetup } from "./ArtistPasswordSetup";
import ArtistForgotPassword from "./ArtistForgotPassword";

type LoginStep = "credentials" | "password" | "setup";

export default function ArtistLoginForm() {
  const [currentStep, setCurrentStep] = useState<LoginStep>("credentials");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [artistData, setArtistData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { handleLogin } = useArtistLogin();

  const checkArtistExistence = async () => {
    if (!emailOrPhone.trim()) {
      toast.error("Please enter email or phone number");
      return;
    }

    setIsLoading(true);
    try {
      const normalizedInput = emailOrPhone.trim().toLowerCase();
      
      // Check if it's email or phone
      const isEmail = normalizedInput.includes('@');
      
      let query = supabase.from('ArtistMST').select('*');
      
      if (isEmail) {
        query = query.eq('emailid', normalizedInput);
      } else {
        // For phone number, check both with and without country code
        const phoneQuery = supabase
          .from('ArtistMST')
          .select('*')
          .or(`ArtistPhno.eq.${normalizedInput},ArtistPhno.eq.91${normalizedInput}`);
        
        const { data, error } = await phoneQuery.maybeSingle();
        
        if (error) {
          console.error("Error checking artist:", error);
          toast.error("Error checking artist details");
          return;
        }

        if (!data) {
          toast.error("No artist found with this phone number");
          return;
        }

        // Check if artist is active
        if (data.Active === false) {
          toast.error("Your account has been deactivated. Please contact support.");
          return;
        }

        setArtistData(data);
        
        if (data.password) {
          setCurrentStep("password");
        } else {
          setCurrentStep("setup");
        }
        return;
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error("Error checking artist:", error);
        toast.error("Error checking artist details");
        return;
      }

      if (!data) {
        toast.error("No artist found with this email");
        return;
      }

      // Check if artist is active
      if (data.Active === false) {
        toast.error("Your account has been deactivated. Please contact support.");
        return;
      }

      setArtistData(data);
      
      if (data.password) {
        setCurrentStep("password");
      } else {
        setCurrentStep("setup");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await handleLogin({
        email: artistData.emailid,
        password: password
      });
      
      if (!success) {
        toast.error("Invalid password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSetupComplete = () => {
    toast.success("Password set successfully! Please login again with your credentials.");
    setCurrentStep("credentials");
    setEmailOrPhone("");
    setPassword("");
    setArtistData(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetForm = () => {
    setCurrentStep("credentials");
    setEmailOrPhone("");
    setPassword("");
    setArtistData(null);
  };

  const handleForgotPasswordSuccess = (phone: string) => {
    setShowForgotPassword(false);
    toast.success("Password reset successfully! You can now login with your new password.");
  };

  if (currentStep === "setup") {
    return (
      <ArtistPasswordSetup 
        artistData={artistData}
        onComplete={handlePasswordSetupComplete}
        onBack={resetForm}
      />
    );
  }

  if (currentStep === "password") {
    return (
      <>
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-2">
            <Label>Artist Email</Label>
            <Input 
              value={artistData?.emailid || emailOrPhone}
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
              {isLoading ? "Signing in..." : "Sign In"}
            </ButtonCustom>
          </div>
        </form>

        <ArtistForgotPassword
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handleForgotPasswordSuccess}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
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
        onClick={checkArtistExistence}
        disabled={isLoading}
      >
        {isLoading ? "Checking..." : "Continue"}
      </ButtonCustom>
    </div>
  );
}
