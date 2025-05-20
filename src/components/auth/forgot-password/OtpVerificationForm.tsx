
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OtpVerificationFormProps {
  isLoading: boolean;
  onSubmit: (otp: string) => Promise<void>;
  onResendOtp: () => void;
  phoneNumber: string;
}

export default function OtpVerificationForm({ 
  isLoading, 
  onSubmit, 
  onResendOtp,
  phoneNumber
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);

  const handleSubmit = async () => {
    if (otp.length === 6) {
      await onSubmit(otp);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Allow only digits
    if (value && !/^\d*$/.test(value)) return;

    // Update the specific position in otpValues array
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Combine all digits for the complete OTP
    const updatedOtp = newOtpValues.join("");
    setOtp(updatedOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace to move to previous input
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center space-y-2">
        <p className="text-sm text-muted-foreground text-center mb-2">
          Enter the 6-digit verification code sent to <span className="font-semibold">{phoneNumber}</span>
        </p>
        
        <div className="flex justify-center gap-2 mt-4 w-full">
          {otpValues.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center border-2 rounded-md focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg"
              autoFocus={index === 0}
              autoComplete={index === 0 ? "one-time-code" : "off"}
            />
          ))}
        </div>
      </div>
      
      <Button 
        className="w-full bg-pink-500 hover:bg-pink-600" 
        onClick={handleSubmit}
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? "Verifying..." : "Verify Phone Number"}
      </Button>
      
      <div className="text-center">
        <Button 
          variant="outline"
          className="w-full border-gray-200"
          onClick={onResendOtp}
          disabled={isLoading}
        >
          Resend OTP
        </Button>
      </div>
    </div>
  );
}
