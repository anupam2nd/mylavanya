
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
    if (!phoneNumber.trim()) {
      showToast("❌ Please enter your phone number", 'error', 4000);
      return;
    }

    if (phoneNumber.length !== 10) {
      showToast("❌ Please enter a valid 10-digit phone number", 'error', 4000);
      return;
    }

    setIsLoading(true);
    try {
      // Check if phone number exists in UserMST for admin/controller/superadmin users
      const { data: userExists, error: userCheckError } = await supabase
        .from('UserMST')
        .select('id, email_id, role, PhoneNo')
        .eq('PhoneNo', parseInt(phoneNumber))
        .in('role', ['admin', 'controller', 'superadmin'])
        .eq('active', true)
        .maybeSingle();

      if (userCheckError) {
        console.error("Error checking user:", userCheckError);
        showToast("❌ Error checking user details", 'error', 4000);
        return;
      }

      if (!userExists) {
        showToast("❌ Phone number not found for admin/controller/superadmin user", 'error', 4000);
        return;
      }

      // Verify the phone number matches the current user's data
      if (userExists.id !== userData.id) {
        showToast("❌ Phone number doesn't match your account", 'error', 4000);
        return;
      }

      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber },
      });

      if (response.error) {
        showToast("❌ Failed to send OTP. Please try again.", 'error', 4000);
        console.error("Error sending OTP:", response.error);
        return;
      }

      showToast("✅ OTP sent successfully!", 'success', 4000);
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
      const response = await supabase.functions.invoke("verify-registration-otp", {
        body: { phoneNumber, otp },
      });

      if (response.error) {
        showToast(`❌ ${response.error.message || "Invalid OTP"}`, 'error', 4000);
        return;
      }

      if (response.data.success) {
        showToast("✅ Phone number verified successfully!", 'success', 4000);
        setCurrentStep("password");
      } else {
        showToast(`❌ ${response.data.error || "Invalid OTP"}`, 'error', 4000);
      }
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
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber },
      });

      if (response.error) {
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
      console.log('Creating Supabase Auth account for admin user:', userData.email_id);
      
      // Create user in Supabase Auth first (NEW MIGRATION APPROACH)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email_id,
        password: newPassword,
        options: {
          data: {
            firstName: userData.FirstName,
            lastName: userData.LastName,
            role: userData.role,
            userMSTId: userData.id
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        console.error("Error creating Supabase auth user:", authError);
        if (authError.message.includes('already registered')) {
          showToast("❌ This email is already registered. Please try logging in instead.", 'error', 4000);
        } else {
          showToast("❌ Failed to create account: " + authError.message, 'error', 4000);
        }
        return;
      }

      console.log('Supabase auth user created successfully:', authData);
      
      // Hash the password for UserMST storage (for backward compatibility)
      const { data: hashResult, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: newPassword }
      });
      
      if (hashError || !hashResult?.hashedPassword) {
        console.error('Password hashing failed:', hashError);
        // Continue without updating UserMST password hash - Supabase Auth is primary now
        console.log('Continuing without UserMST password update');
      } else {
        // Update UserMST with hashed password and Supabase auth ID using phone number
        const { error: updateError } = await supabase
          .from('UserMST')
          .update({ 
            password: hashResult.hashedPassword,
            id: authData.user.id
          })
          .eq('PhoneNo', parseInt(phoneNumber));
        
        if (updateError) {
          console.error('Error updating UserMST:', updateError);
          // Continue even if UserMST update fails - Supabase Auth account is primary
          console.log('Continuing despite UserMST update error');
        }
      }

      // Password setup completed successfully
      console.log("Admin user migrated to Supabase Auth successfully:", userData.id);
      showToast("🎉 Account created successfully! Please use the login form to sign in.", 'success', 4000);
      onComplete();
    } catch (error) {
      console.error("Error:", error);
      showToast("❌ Failed to set up account. Please try again.", 'error', 4000);
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
