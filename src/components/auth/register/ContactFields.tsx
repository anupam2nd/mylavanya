
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RegisterFormValues } from "./RegisterFormSchema";
import { Asterisk } from "lucide-react";
import OtpVerificationModal from "./OtpVerificationModal";

const ContactFields = () => {
  const form = useFormContext<RegisterFormValues>();
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  
  const phoneNumber = form.watch("phoneNumber");
  const isPhoneVerified = form.watch("isPhoneVerified");
  
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    // Check if phone number is already registered
    try {
      setSendingOtp(true);
      
      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from('MemberMST')
        .select('id')
        .eq('MemberPhNo', phoneNumber)
        .limit(1);
      
      if (phoneCheckError) {
        throw phoneCheckError;
      }
      
      if (existingPhone && existingPhone.length > 0) {
        toast.error("This phone number is already registered");
        setSendingOtp(false);
        return;
      }

      // Send OTP via Supabase Edge Function
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber }
      });

      if (response.error) {
        toast.error("Failed to send OTP. Please try again.");
        console.error("Error sending OTP:", response.error);
      } else {
        toast.success("OTP sent successfully!");
        setOtpModalOpen(true);
      }
    } catch (error) {
      console.error("Error in OTP process:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpSuccess = () => {
    form.setValue("isPhoneVerified", true);
    setOtpModalOpen(false);
    toast.success("Phone number verified successfully!");
  };

  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Email <Asterisk className="h-3 w-3 text-red-500" />
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter your email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  Phone Number <Asterisk className="h-3 w-3 text-red-500" />
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your phone number" 
                    {...field} 
                    maxLength={10}
                    onChange={(e) => {
                      // Reset verification if phone number changes
                      if (field.value !== e.target.value && form.getValues("isPhoneVerified")) {
                        form.setValue("isPhoneVerified", false);
                      }
                      
                      // Allow only numbers
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      field.onChange(value);
                    }}
                    disabled={isPhoneVerified}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ButtonCustom
          type="button"
          variant={isPhoneVerified ? "primary-gradient" : "secondary"}
          className="mb-[2px] whitespace-nowrap"
          onClick={handleSendOTP}
          disabled={sendingOtp || phoneNumber?.length !== 10 || isPhoneVerified}
          isLoading={sendingOtp}
        >
          {isPhoneVerified ? "Verified ✓" : "Verify Phone"}
        </ButtonCustom>
      </div>

      <FormField
        control={form.control}
        name="isPhoneVerified"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormControl>
              <input type="checkbox" checked={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <OtpVerificationModal
        open={otpModalOpen}
        onOpenChange={setOtpModalOpen}
        phoneNumber={phoneNumber}
        onVerificationSuccess={handleOtpSuccess}
      />
    </>
  );
};

export default ContactFields;
