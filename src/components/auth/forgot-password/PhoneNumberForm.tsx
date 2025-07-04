
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";

interface PhoneNumberFormProps {
  onSubmit: (phoneNumber: string) => void;
}

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(10, "Phone number must be 10 digits"),
});

export function PhoneNumberForm({ onSubmit }: PhoneNumberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useCustomToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      // Check if phone number exists in the database
      const { data: existingUser, error } = await supabase
        .from('MemberMST')
        .select('id')
        .eq('MemberPhNo', data.phoneNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          showToast("❌ No account found with this phone number", 'error', 4000);
          return;
        }
        throw error;
      }

      // Send OTP
      const response = await supabase.functions.invoke("send-registration-otp", {
        body: { phoneNumber: data.phoneNumber },
      });

      if (response.error) {
        showToast("❌ Failed to send OTP. Please try again.", 'error', 4000);
        console.error("Error sending OTP:", response.error);
        return;
      }

      showToast("📱 OTP sent successfully!", 'success', 4000);
      onSubmit(data.phoneNumber);
    } catch (error) {
      console.error("Error in phone verification process:", error);
      showToast("❌ Something went wrong. Please try again.", 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <Input 
                placeholder="Enter your phone number" 
                {...field} 
                maxLength={10}
                onChange={(e) => {
                  // Allow only numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  field.onChange(value);
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Send OTP"}
        </Button>
      </form>
    </Form>
  );
}
