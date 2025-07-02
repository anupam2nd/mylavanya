
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneNumberForm } from "./forgot-password/PhoneNumberForm";
import { OtpVerificationForm } from "./forgot-password/OtpVerificationForm";
import { PasswordResetForm } from "./forgot-password/PasswordResetForm";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";

interface AdminForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string) => void;
}

type Step = "phone" | "otp" | "reset";

export default function AdminForgotPassword({
  isOpen,
  onClose,
  onSuccess,
}: AdminForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { showToast } = useCustomToast();

  const handlePhoneSubmit = async (phone: string) => {
    try {
      // Check if phone number exists in UserMST table for admin/controller users
      const { data, error } = await supabase
        .from('UserMST')
        .select('id, role')
        .eq('PhoneNo', parseInt(phone))
        .in('role', ['admin', 'controller', 'superadmin'])
        .maybeSingle();

      if (error) {
        console.error("Error checking user:", error);
        showToast("❌ Error checking user details", 'error', 4000);
        return;
      }

      if (!data) {
        showToast("❌ No admin/controller user found with this phone number", 'error', 4000);
        return;
      }

      // Send OTP
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber: phone },
      });

      if (response.error) {
        showToast("❌ Failed to send OTP. Please try again.", 'error', 4000);
        console.error("Error sending OTP:", response.error);
        return;
      }

      showToast("📱 OTP sent successfully!", 'success', 4000);
      setPhoneNumber(phone);
      setCurrentStep("otp");
    } catch (error) {
      console.error("Error in phone verification process:", error);
      showToast("❌ Something went wrong. Please try again.", 'error', 4000);
    }
  };

  const handleOtpSuccess = () => {
    setCurrentStep("reset");
  };

  const handlePasswordResetSuccess = async () => {
    try {
      // The actual password update is handled by the PasswordResetForm component
      // This function is called after the password has been successfully updated
      console.log('Password reset completed for admin/controller with phone:', phoneNumber);
      showToast("🎉 Password updated successfully!", 'success', 4000);
      onSuccess(phoneNumber);
      onClose();
    } catch (error) {
      console.error("Error in password reset completion:", error);
      showToast("❌ Failed to complete password reset", 'error', 4000);
    }
  };

  const handleClose = () => {
    setCurrentStep("phone");
    setPhoneNumber("");
    onClose();
  };

  const getTitle = () => {
    switch (currentStep) {
      case "phone":
        return "Admin Password Reset";
      case "otp":
        return "Verify OTP";
      case "reset":
        return "Set New Password";
      default:
        return "Admin Password Reset";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{getTitle()}</DialogTitle>
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <div className="py-4">
          {currentStep === "phone" && (
            <PhoneNumberForm onSubmit={handlePhoneSubmit} />
          )}
          
          {currentStep === "otp" && (
            <OtpVerificationForm
              phoneNumber={phoneNumber}
              onVerificationSuccess={handleOtpSuccess}
            />
          )}
          
          {currentStep === "reset" && (
            <AdminPasswordResetForm
              phoneNumber={phoneNumber}
              onPasswordResetSuccess={handlePasswordResetSuccess}
            />
          )}
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Admin-specific password reset form that handles the actual password update
function AdminPasswordResetForm({ 
  phoneNumber, 
  onPasswordResetSuccess 
}: { 
  phoneNumber: string; 
  onPasswordResetSuccess: () => void; 
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      showToast("❌ Password must be at least 8 characters", 'error', 4000);
      return;
    }
    
    if (password !== confirmPassword) {
      showToast("❌ Passwords do not match", 'error', 4000);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting password reset for admin/controller with phone:', phoneNumber);
      
      // Hash the password using the edge function
      const { data: hashResult, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: password }
      });
      
      if (hashError) {
        console.error('Error hashing password for admin/controller:', hashError);
        showToast("❌ Failed to update password", 'error', 4000);
        return;
      }
      
      if (!hashResult?.hashedPassword) {
        console.error('No hashed password returned from edge function for admin/controller');
        showToast("❌ Failed to update password", 'error', 4000);
        return;
      }
      
      console.log('Password hashed successfully for admin/controller, updating database');
      
      // Update password in UserMST table with the hashed password
      const { error } = await supabase
        .from('UserMST')
        .update({ password: hashResult.hashedPassword })
        .eq('PhoneNo', parseInt(phoneNumber));

      if (error) {
        console.error('Error updating admin/controller password in database:', error);
        throw error;
      }

      console.log('Admin/controller password updated successfully in database');
      onPasswordResetSuccess();
    } catch (error) {
      console.error("Error updating admin/controller password:", error);
      showToast("❌ Failed to update password", 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium">
          New Password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium">
          Confirm New Password
        </label>
        <input
          id="confirm-password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Updating Password..." : "Update Password"}
      </Button>
    </form>
  );
}
