
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";

interface OtpVerificationFormProps {
  isLoading: boolean;
  onSubmit: (otp: string) => Promise<void>;
  onResendOtp: () => void;
}

export default function OtpVerificationForm({ 
  isLoading, 
  onSubmit, 
  onResendOtp 
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = async () => {
    await onSubmit(otp);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center space-y-2">
        <Label htmlFor="otp-input">One-Time Password</Label>
        <InputOTP 
          maxLength={6} 
          value={otp} 
          onChange={setOtp}
          id="otp-input"
          autoComplete="one-time-code"
          autoFocus={true}
          placeholder=""
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot 
                  key={index} 
                  {...slot} 
                  index={index} 
                  className="w-12 h-12 text-lg border-2 focus:border-pink-500 focus:ring-pink-500 focus-visible:ring-pink-500 cursor-text bg-white"
                />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
      <Button 
        className="w-full bg-pink-500 hover:bg-pink-600" 
        onClick={handleSubmit}
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </Button>
      
      <div className="text-center">
        <Button 
          variant="link" 
          className="p-0 h-auto text-xs text-pink-500 hover:text-pink-600"
          onClick={onResendOtp}
          disabled={isLoading}
        >
          Didn't receive code? Resend OTP
        </Button>
      </div>
    </div>
  );
}
