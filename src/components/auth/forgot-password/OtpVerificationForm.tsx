
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
        // Handle different types of errors with user-friendly messages
        if (response.error.message?.includes("Invalid OTP") || 
            response.error.message?.includes("invalid_otp")) {
          toast.error("Invalid OTP. Please check the code and try again.");
        } else if (response.error.message?.includes("expired") || 
                   response.error.message?.includes("OTP expired")) {
          toast.error("OTP has expired. Please request a new one.");
        } else if (response.error.message?.includes("not found")) {
          toast.error("OTP not found. Please request a new one.");
        } else {
          toast.error("Failed to verify OTP. Please try again.");
        }
        console.error("OTP verification error:", response.error);
        return;
      }

      if (response.data?.success) {
        toast.success("Phone number verified successfully!");
        onVerificationSuccess();
      } else if (response.data?.error) {
        // Handle specific error messages from the server
        const errorMessage = response.data.error;
        if (errorMessage.includes("Invalid OTP") || errorMessage.includes("invalid")) {
          toast.error("Invalid OTP. Please check the code and try again.");
        } else if (errorMessage.includes("expired")) {
          toast.error("OTP has expired. Please request a new one.");
        } else {
          toast.error("Failed to verify OTP. Please try again.");
        }
      } else {
        toast.error("Invalid OTP. Please check the code and try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Something went wrong. Please try again.");
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
        if (response.error.message?.includes("not found")) {
          toast.error("Phone number not found. Please check and try again.");
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
        console.error("Error sending OTP:", response.error);
        return;
      }

      toast.success("New OTP sent successfully!");
      setOtp(""); // Clear the current OTP input
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
      
      {otp.length === 6 && (
        <p className="text-xs text-muted-foreground text-center">
          Click "Verify OTP" to confirm your code
        </p>
      )}
      
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
      
      <p className="text-xs text-muted-foreground text-center">
        Didn't receive the code? Wait a moment and try resending.
      </p>
    </div>
  );
}
