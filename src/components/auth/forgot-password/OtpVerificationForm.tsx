
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

interface OtpVerificationFormProps {
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

export function OtpVerificationForm({
  phoneNumber,
  onVerificationSuccess,
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
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
        toast.error(response.error.message || "Failed to verify OTP");
        return;
      }

      if (response.data.success) {
        toast.success("Phone number verified successfully!");
        onVerificationSuccess();
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
        toast.error(response.error.message || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        Enter the 6-digit verification code sent to your phone number {phoneNumber}
      </p>
      
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
        <Button
          onClick={handleVerify}
          disabled={isLoading || otp.length !== 6 || isResending}
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
        </Button>
        
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
