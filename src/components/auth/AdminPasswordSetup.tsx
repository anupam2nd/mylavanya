
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface AdminPasswordSetupProps {
  userData: any;
  onComplete: () => void;
  onBack: () => void;
}

type SetupStep = "phone" | "otp" | "password";

export function AdminPasswordSetup({ userData, onComplete, onBack }: AdminPasswordSetupProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { showToast } = useCustomToast();

  const sendOTP = async () => {
    // Use phone number from auth user if available, otherwise ask for input
    const phone = userData.authUser?.phone || phoneNumber.trim();
    
    if (!phone) {
      showToast("❌ Please enter your phone number", 'error', 4000);
      return;
    }

    setIsLoading(true);
    try {
      // Send OTP using signInWithOtp
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) {
        console.error("Error sending OTP:", error);
        showToast("❌ Failed to send OTP. Please try again.", 'error', 4000);
        return;
      }

      showToast("✅ OTP sent successfully!", 'success', 4000);
      setPhoneNumber(phone);
      setCurrentStep("otp");
    } catch (error) {
      console.error("Error sending OTP:", error);
      showToast("❌ Failed to send OTP. Please try again.", 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      showToast("❌ Please enter a valid 6-digit OTP", 'error', 4000);
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP using verifyOtp
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms'
      });

      if (error) {
        showToast(`❌ ${error.message || "Invalid OTP"}`, 'error', 4000);
        return;
      }

      showToast("✅ Phone number verified successfully!", 'success', 4000);
      setCurrentStep("password");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showToast("❌ Failed to verify OTP. Please try again.", 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) {
        showToast("❌ Failed to resend OTP. Please try again.", 'error', 4000);
        return;
      }

      showToast("✅ OTP resent successfully!", 'success', 4000);
    } catch (error) {
      console.error("Error resending OTP:", error);
      showToast("❌ Failed to resend OTP. Please try again.", 'error', 4000);
    } finally {
      setIsResending(false);
    }
  };

  const setPassword = async () => {
    if (!newPassword.trim()) {
      showToast("❌ Please enter a password", 'error', 4000);
      return;
    }

    if (newPassword.length < 8) {
      showToast("❌ Password must be at least 8 characters long", 'error', 4000);
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("❌ Passwords do not match", 'error', 4000);
      return;
    }

    setIsLoading(true);
    try {
      // Update the user's password now that they are logged in via OTP
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error("Error updating password:", error);
        showToast("❌ Failed to set password: " + error.message, 'error', 4000);
        return;
      }

      showToast("🎉 Password set successfully! You can now login with your credentials.", 'success', 4000);
      onComplete();
    } catch (error) {
      console.error("Error:", error);
      showToast("❌ Failed to set password. Please try again.", 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === "phone") {
    // If user already has phone in auth data, skip to OTP
    if (userData.authUser?.phone) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Set Up Your Password</h3>
            <p className="text-sm text-muted-foreground">
              We'll send an OTP to your registered phone number: {userData.authUser.phone}
            </p>
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
            placeholder="Enter your phone number" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
