
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

  const handlePasswordResetSuccess = async (newPassword: string) => {
    try {
      console.log('Starting password reset for admin/controller with phone:', phoneNumber);
      
      // Hash the password using the edge function - this is critical for admin/controller security
      const { data: hashResult, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: newPassword }
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
      showToast("🎉 Password updated successfully!", 'success', 4000);
      onSuccess(phoneNumber);
      onClose();
    } catch (error) {
      console.error("Error updating admin/controller password:", error);
      showToast("❌ Failed to update password", 'error', 4000);
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
            <PasswordResetForm
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
