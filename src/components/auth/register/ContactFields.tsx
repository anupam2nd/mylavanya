
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn, useWatch } from "react-hook-form";
import { RegisterFormValues } from "./RegisterFormSchema";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import OtpVerificationModal from "./OtpVerificationModal";

interface ContactFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
}

export default function ContactFields({ form }: ContactFieldsProps) {
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Watch the phone number field to enable/disable the verify button
  const phoneNumber = useWatch({
    control: form.control,
    name: "phoneNumber",
    defaultValue: ""
  });

  const handleSendOtp = async () => {
    // Basic validation
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsVerifyingPhone(true);
    try {
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber },
      });

      if (response.error) {
        toast.error(response.error.message || "Failed to send OTP");
        return;
      }

      setShowOtpModal(true);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleVerificationSuccess = () => {
    setIsPhoneVerified(true);
    form.clearErrors("phoneNumber");
  };

  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Email <span className="text-xs text-muted-foreground">(This will be your login ID)</span>
            </FormLabel>
            <FormControl>
              <Input type="email" placeholder="Your email address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <span className="bg-muted px-3 py-2 text-sm border border-r-0 rounded-l-md">+91</span>
                <Input 
                  className="rounded-l-none flex-1" 
                  placeholder="10 digit number" 
                  maxLength={10} 
                  {...field} 
                  disabled={isPhoneVerified}
                />
                <Button 
                  type="button"
                  variant={isPhoneVerified ? "ghost" : "secondary"}
                  className="ml-2"
                  onClick={handleSendOtp}
                  disabled={isVerifyingPhone || isPhoneVerified || !phoneNumber || phoneNumber.length !== 10}
                >
                  {isVerifyingPhone ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPhoneVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <OtpVerificationModal 
        open={showOtpModal}
        onOpenChange={setShowOtpModal}
        phoneNumber={phoneNumber}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </>
  );
}
