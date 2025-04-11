
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface OTPVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  bookingId: number;
}

// Define the validation schema for OTP
const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must contain only numbers" })
});

type OTPFormValues = z.infer<typeof otpSchema>;

export const OTPVerificationDialog: React.FC<OTPVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerify,
  bookingId,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (isOpen) {
      form.reset({ otp: "" });
    }
  }, [isOpen, form]);

  const handleVerify = async (values: OTPFormValues) => {
    try {
      setIsVerifying(true);
      
      // Using raw query since booking_otps is not in TypeScript definitions
      const { data, error } = await supabase
        .rpc('verify_booking_otp' as any, {
          p_booking_id: bookingId,
          p_otp: values.otp
        });
      
      if (error || !data) {
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit code sent to the customer's mobile number
              </p>
              
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="flex justify-center my-6">
                      <InputOTP 
                        maxLength={6} 
                        value={field.value} 
                        onChange={field.onChange}
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
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="sm:w-auto w-full"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!form.formState.isValid || isVerifying}
                className="sm:w-auto w-full"
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
