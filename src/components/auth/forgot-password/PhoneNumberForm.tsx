
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PhoneNumberFormProps {
  isLoading: boolean;
  onSubmit: (phoneNumber: string) => Promise<void>;
}

export default function PhoneNumberForm({ isLoading, onSubmit }: PhoneNumberFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async () => {
    if (!phoneNumber.trim() || phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    
    await onSubmit(phoneNumber);
  };

  // Handle phone number input changes with proper digit-only filtering
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '');
    setPhoneNumber(digitsOnly.slice(0, 10));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-phone">Phone Number</Label>
        <Input 
          id="reset-phone" 
          type="tel" 
          placeholder="Enter your 10-digit phone number" 
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          maxLength={10}
          inputMode="numeric"
        />
      </div>
      <Button 
        className="w-full bg-pink-500 hover:bg-pink-600" 
        onClick={handleSubmit}
        disabled={isLoading || phoneNumber.length !== 10}
      >
        {isLoading ? "Sending..." : "Send OTP"}
      </Button>
    </div>
  );
}
