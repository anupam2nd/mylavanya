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
import { OtpVerificationForm } from "./forgot-password/OtpVerificationForm";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ArtistForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string) => void;
}

type Step = "phone" | "otp" | "reset";

export default function ArtistForgotPassword({
  isOpen,
  onClose,
  onSuccess,
}: ArtistForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneSubmit = async (phone: string) => {
    try {
      // Check if phone number exists in ArtistMST table
      const { data, error } = await supabase
        .from('ArtistMST')
        .select('ArtistId, Active')
        .or(`ArtistPhno.eq.${phone},ArtistPhno.eq.91${phone}`)
        .maybeSingle();

      if (error) {
        console.error("Error checking artist:", error);
        toast.error("Error checking artist details");
        return;
      }

      if (!data) {
        toast.error("No artist found with this phone number");
        return;
      }

      if (data.Active === false) {
        toast.error("Your account has been deactivated. Please contact support.");
        return;
      }

      // Send OTP
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber: phone },
      });

      if (response.error) {
        toast.error("Failed to send OTP. Please try again.");
        console.error("Error sending OTP:", response.error);
        return;
      }

      toast.success("OTP sent successfully!");
      setPhoneNumber(phone);
      setCurrentStep("otp");
    } catch (error) {
      console.error("Error in phone verification process:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleOtpSuccess = () => {
    setCurrentStep("reset");
  };

  const handlePasswordResetSuccess = async (newPassword: string) => {
    try {
      console.log('Starting password reset for artist with phone:', phoneNumber);
      
      // Hash the password using the edge function - this is critical for artist security
      const { data: hashResult, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: newPassword }
      });
      
      if (hashError) {
        console.error('Error hashing password for artist:', hashError);
        toast.error("Failed to update password");
        return;
      }
      
      if (!hashResult?.hashedPassword) {
        console.error('No hashed password returned from edge function for artist');
        toast.error("Failed to update password");
        return;
      }
      
      console.log('Password hashed successfully for artist, updating database');
      
      // Update password in ArtistMST table with the hashed password
      const { error } = await supabase
        .from('ArtistMST')
        .update({ password: hashResult.hashedPassword })
        .or(`ArtistPhno.eq.${phoneNumber},ArtistPhno.eq.91${phoneNumber}`);

      if (error) {
        console.error('Error updating artist password in database:', error);
        throw error;
      }

      console.log('Artist password updated successfully in database');
      toast.success("Password updated successfully!");
      onSuccess(phoneNumber);
      onClose();
    } catch (error) {
      console.error("Error updating artist password:", error);
      toast.error("Failed to update password");
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
        return "Artist Password Reset";
      case "otp":
        return "Verify OTP";
      case "reset":
        return "Set New Password";
      default:
        return "Artist Password Reset";
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
            <ArtistPhoneNumberForm onSubmit={handlePhoneSubmit} />
          )}
          
          {currentStep === "otp" && (
            <OtpVerificationForm
              phoneNumber={phoneNumber}
              onVerificationSuccess={handleOtpSuccess}
            />
          )}
          
          {currentStep === "reset" && (
            <ArtistPasswordResetForm
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

// Artist-specific phone number form
function ArtistPhoneNumberForm({ onSubmit }: { onSubmit: (phone: string) => void }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setIsLoading(true);
    await onSubmit(phoneNumber);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length <= 10) {
              setPhoneNumber(value);
            }
          }}
          maxLength={10}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );
}

// Artist-specific password reset form
function ArtistPasswordResetForm({ 
  phoneNumber, 
  onPasswordResetSuccess 
}: { 
  phoneNumber: string; 
  onPasswordResetSuccess: (password: string) => void; 
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    await onPasswordResetSuccess(password);
    setIsLoading(false);
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
