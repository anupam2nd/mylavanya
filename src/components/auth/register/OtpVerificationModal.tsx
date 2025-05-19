
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OtpVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

const OtpVerificationModal = ({
  open,
  onOpenChange,
  phoneNumber,
  onVerificationSuccess,
}: OtpVerificationModalProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await supabase.functions.invoke("verify-registration-otp", {
        body: { phoneNumber, otp },
      });

      if (response.error) {
        toast.error(response.error.message || "Failed to verify OTP");
        return;
      }

      if (response.data.success) {
        toast.success("Phone number verified successfully!");
        onVerificationSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.data.error || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber },
      });

      if (response.error) {
        toast.error(response.error.message || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Verify Your Phone Number</DialogTitle>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Enter the 6-digit verification code sent to your phone number {phoneNumber}
          </p>
          <div className="flex justify-center mb-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length !== 6}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Phone Number"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleResendOtp}
              disabled={isVerifying}
              className="w-full"
            >
              Resend OTP
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OtpVerificationModal;
