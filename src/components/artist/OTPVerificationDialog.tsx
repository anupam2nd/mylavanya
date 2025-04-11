
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OTPVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  bookingId: number;
}

export const OTPVerificationDialog: React.FC<OTPVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerify,
  bookingId,
}) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP.",
      });
      return;
    }

    try {
      setIsVerifying(true);
      
      // Check if OTP exists and is valid using a stored procedure
      const { data, error } = await supabase
        .rpc('verify_booking_otp', { 
          p_booking_id: bookingId,
          p_otp: otp
        });
      
      if (error) throw error;
      
      if (!data) {
        toast({
          variant: "destructive",
          title: "Invalid or Expired OTP",
          description: "The OTP you entered is invalid or has expired. Please request a new one.",
        });
        return;
      }
      
      // OTP verified successfully
      toast({
        title: "OTP Verified",
        description: "Service confirmation successful.",
      });
      
      // Call the onVerify callback
      onVerify();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "There was an error verifying the OTP. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify OTP</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Enter the 6-digit code sent to the customer's mobile number
          </p>
          
          <div className="flex justify-center my-6">
            <InputOTP 
              maxLength={6} 
              value={otp} 
              onChange={setOtp}
              pattern="^[0-9]{1,6}$"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={otp.length !== 6 || isVerifying}
            className="sm:w-auto w-full"
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
