
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { passwordResetSchema } from "./forgot-password/schemas";
import PhoneNumberForm from "./forgot-password/PhoneNumberForm";
import OtpVerificationForm from "./forgot-password/OtpVerificationForm";
import PasswordResetForm from "./forgot-password/PasswordResetForm";

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string) => void;
}

export default function ForgotPassword({ isOpen, onClose, onSuccess }: ForgotPasswordProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [forgotStep, setForgotStep] = useState<"phone" | "otp" | "reset">("phone");
  const [resetLoading, setResetLoading] = useState(false);
  const [verifiedMemberId, setVerifiedMemberId] = useState<string | null>(null);

  const handlePhoneSubmit = async (phone: string) => {
    setPhoneNumber(phone);
    setResetLoading(true);
    
    try {
      // Check if phone number exists in MemberMST
      const { data, error } = await supabase
        .from('MemberMST')
        .select('id, MemberPhNo')
        .eq('MemberPhNo', phone.trim())
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        toast.error("No account found with this phone number");
        return;
      }

      // Store the member ID for later use when updating password
      setVerifiedMemberId(data.id.toString());
      
      // Send OTP via Supabase Edge Function
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber: phone }
      });

      if (response.error) {
        toast.error("Failed to send OTP. Please try again.");
        console.error("Error sending OTP:", response.error);
        return;
      }
      
      toast.success("OTP sent successfully!");
      setForgotStep("otp");
    } catch (error) {
      console.error("Error in password reset:", error);
      toast.error("Error processing your request");
    } finally {
      setResetLoading(false);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    setResetLoading(true);
    
    try {
      // Verify the OTP
      const response = await supabase.functions.invoke("verify-registration-otp", {
        body: { phoneNumber, otp }
      });
      
      if (response.error || !response.data.success) {
        toast.error(response.error?.message || response.data?.error || "Invalid OTP");
        return;
      }
      
      setForgotStep("reset");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error verifying OTP");
    } finally {
      setResetLoading(false);
    }
  };

  const handlePasswordReset = async (values: z.infer<typeof passwordResetSchema>) => {
    if (!verifiedMemberId) {
      toast.error("Verification error. Please try again.");
      return;
    }

    setResetLoading(true);
    try {
      // Update password in the database for the verified member
      // Convert the string ID to a number since MemberMST.id is a bigint/number type
      const memberId = parseInt(verifiedMemberId);
      
      // Check for valid ID conversion
      if (isNaN(memberId)) {
        toast.error("Invalid member ID. Please try again.");
        return;
      }
      
      const { error } = await supabase
        .from('MemberMST')
        .update({ password: values.password })
        .eq('id', memberId);
        
      if (error) {
        throw error;
      }
      
      toast.success("Password Reset Successfully", { 
        description: "Your password has been successfully reset. You can now log in with your new password." 
      });
      
      handleClose();
      
      // Pass phone number back to parent for auto-fill
      onSuccess(phoneNumber);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Error updating your password");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (!resetLoading) {
      handlePhoneSubmit(phoneNumber);
      toast.info("Sending a new OTP code...");
    }
  };

  // Close handler to reset the form state
  const handleClose = () => {
    setForgotStep("phone");
    setPhoneNumber("");
    setVerifiedMemberId(null);
    onClose();
  };

  const getTitle = () => {
    switch (forgotStep) {
      case "phone": return "Reset Password";
      case "otp": return "Enter OTP";
      case "reset": return "Create New Password";
      default: return "Reset Password";
    }
  };

  const getDescription = () => {
    switch (forgotStep) {
      case "phone": return "Enter your phone number to receive a one-time password";
      case "otp": return "Enter the OTP sent to your phone number";
      case "reset": return "Create a new password that meets the requirements below";
      default: return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {forgotStep === "phone" && (
          <PhoneNumberForm 
            isLoading={resetLoading} 
            onSubmit={handlePhoneSubmit} 
          />
        )}

        {forgotStep === "otp" && (
          <OtpVerificationForm 
            isLoading={resetLoading} 
            onSubmit={handleOtpSubmit}
            onResendOtp={handleResendOtp}
          />
        )}

        {forgotStep === "reset" && (
          <PasswordResetForm 
            isLoading={resetLoading} 
            onSubmit={handlePasswordReset} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
