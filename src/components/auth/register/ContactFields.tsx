
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
import { RegisterFormValues } from "./RegisterFormSchema";
import { Asterisk } from "lucide-react";
import OtpVerificationModal from "./OtpVerificationModal";

const ContactFields = () => {
  const form = useFormContext<RegisterFormValues>();
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const { showToast } = useCustomToast();
  
  const phoneNumber = form.watch("phoneNumber");
  const isPhoneVerified = form.watch("isPhoneVerified");
  
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      showToast("❌ Please enter a valid 10-digit phone number", 'error', 4000);
      return;
    }

    // Check if phone number is already registered with enhanced error messaging
    try {
      setSendingOtp(true);
      
      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from('MemberMST')
        .select('id, MemberEmailId')
        .eq('MemberPhNo', phoneNumber)
        .limit(1);
      
      if (phoneCheckError) {
        throw phoneCheckError;
      }
      
      if (existingPhone && existingPhone.length > 0) {
        showToast(`❌ This phone number is already registered with email: ${existingPhone[0].MemberEmailId}`, 'error', 4000);
        setSendingOtp(false);
        return;
      }

      // Send OTP via Supabase Edge Function
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber }
      });

      if (response.error) {
        showToast("❌ Failed to send OTP. Please try again.", 'error', 4000);
        console.error("Error sending OTP:", response.error);
      } else {
        showToast("📱 OTP sent successfully!", 'success', 4000);
        setOtpModalOpen(true);
      }
    } catch (error) {
      console.error("Error in OTP process:", error);
      showToast("❌ Something went wrong. Please try again.", 'error', 4000);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpSuccess = () => {
    form.setValue("isPhoneVerified", true);
    setOtpModalOpen(false);
    showToast("✅ Phone number verified successfully! This number is now reserved for your account.", 'success', 4000);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Enter your email (optional)" {...field} />
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
                {isPhoneVerified && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Phone number verified and reserved for your account
                  </p>
                )}
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
