
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface ArtistPasswordSetupProps {
  artistData: any;
  onComplete: () => void;
  onBack: () => void;
}

type SetupStep = "phone" | "otp" | "password";

export function ArtistPasswordSetup({ artistData, onComplete, onBack }: ArtistPasswordSetupProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber },
      });

      if (response.error) {
        toast.error("Failed to send OTP. Please try again.");
        console.error("Error sending OTP:", response.error);
        return;
      }

      toast.success("OTP sent successfully!");
      setCurrentStep("otp");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("verify-registration-otp", {
        body: { phoneNumber, otp },
      });

      if (response.error) {
        toast.error(response.error.message || "Invalid OTP");
        return;
      }

      if (response.data.success) {
        toast.success("Phone number verified successfully!");
        setCurrentStep("password");
      } else {
        toast.error(response.data.error || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber },
      });

      if (response.error) {
        toast.error("Failed to resend OTP. Please try again.");
        return;
      }

      toast.success("OTP resent successfully!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const setPassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Please enter a password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // Hash the password using the edge function
      const { data: hashResult, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: newPassword }
      });
      
      if (hashError) {
        console.error('Error hashing password:', hashError);
        toast.error("Failed to process password. Please try again.");
        return;
      }
      
      if (!hashResult?.hashedPassword) {
        console.error('No hashed password returned from edge function');
        toast.error("Failed to process password. Please try again.");
        return;
      }

      const { error } = await supabase
        .from('ArtistMST')
        .update({ password: hashResult.hashedPassword })
        .eq('ArtistId', artistData.ArtistId);

      if (error) {
        console.error("Error updating password:", error);
        toast.error("Failed to set password. Please try again.");
        return;
      }

      toast.success("Password set successfully!");
      onComplete();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to set password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === "phone") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Set Up Your Password</h3>
          <p className="text-sm text-muted-foreground">
            Welcome! You need to set up a password for your account. Please enter your phone number to receive an OTP.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone"
            type="tel"
            placeholder="Enter your 10-digit phone number" 
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 10) {
                setPhoneNumber(value);
              }
            }}
            maxLength={10}
            required
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <ButtonCustom 
            variant="primary-gradient" 
            className="flex-1"
            onClick={sendOTP}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </ButtonCustom>
        </div>
      </div>
    );
  }

  if (currentStep === "otp") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Verify Phone Number</h3>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to {phoneNumber}
          </p>
        </div>
        
        <div className="flex justify-center mb-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isLoading}
            className="gap-2"
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot key={index} index={index} className="w-10 h-12" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        
        <div className="flex flex-col gap-3">
          <ButtonCustom
            variant="primary-gradient"
            onClick={verifyOTP}
            disabled={isLoading || otp.length !== 6}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </ButtonCustom>
          
          <Button
            variant="outline"
            onClick={handleResendOtp}
            disabled={isLoading || isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend OTP"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Create Your Password</h3>
        <p className="text-sm text-muted-foreground">
          Please create a secure password for your account (minimum 8 characters).
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <div className="relative">
          <Input 
            id="new-password"
            type={showPassword ? "text" : "password"} 
            placeholder="Enter new password (min 8 characters)" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
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

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative">
          <Input 
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="Confirm your password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button 
            type="button" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep("phone")}
          className="flex-1"
        >
          Back
        </Button>
        <ButtonCustom 
          variant="primary-gradient" 
          className="flex-1"
          onClick={setPassword}
          disabled={isLoading}
        >
          {isLoading ? "Setting Password..." : "Set Password"}
        </ButtonCustom>
      </div>
    </div>
  );
}
