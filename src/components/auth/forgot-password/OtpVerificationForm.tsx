
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";

interface OtpVerificationFormProps {
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

const formSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export function OtpVerificationForm({ phoneNumber, onVerificationSuccess }: OtpVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useCustomToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const response = await supabase.functions.invoke("verify-registration-otp", {
        body: { phoneNumber, otp: data.otp },
      });

      if (response.error) {
        showToast("❌ Failed to verify OTP. Please try again.", 'error', 4000);
        console.error("Error verifying OTP:", response.error);
        return;
      }

      if (response.data.success) {
        showToast("✅ OTP verified successfully!", 'success', 4000);
        onVerificationSuccess();
      } else {
        showToast("❌ Invalid OTP. Please check and try again.", 'error', 4000);
      }
    } catch (error) {
      console.error("Error in OTP verification process:", error);
      showToast("❌ Something went wrong. Please try again.", 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber },
      });

      if (response.error) {
        showToast("❌ Failed to send OTP. Please try again.", 'error', 4000);
        console.error("Error sending OTP:", response.error);
        return;
      }

      showToast("📱 OTP sent successfully!", 'success', 4000);
    } catch (error) {
      console.error("Error sending OTP:", error);
      showToast("❌ Failed to send OTP. Please try again.", 'error', 4000);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Enter the 6-digit verification code sent to your phone number {phoneNumber}
        </p>
        
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col gap-3">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || form.watch("otp").length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
          
          <Button 
            type="button"
            variant="outline" 
            onClick={handleResendOtp}
            disabled={isLoading}
            className="w-full"
          >
            Resend OTP
          </Button>
        </div>
      </form>
    </Form>
  );
}
