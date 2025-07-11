
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";

interface PhoneNumberFormProps {
  onSubmit: (phoneNumber: string) => void;
  isLoading?: boolean;
}

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(10, "Phone number must be 10 digits"),
});

export function PhoneNumberForm({ onSubmit, isLoading = false }: PhoneNumberFormProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useCustomToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    
    try {
      // Check if phone number exists in MemberMST table
      const { data: members, error } = await supabase
        .from('MemberMST')
        .select('MemberPhNo')
        .eq('MemberPhNo', data.phoneNumber)
        .limit(1);

      if (error) {
        console.error('Error checking member:', error);
        showToast("❌ Error checking phone number. Please try again.", 'error', 4000);
        return;
      }

      if (!members || members.length === 0) {
        showToast("❌ Phone number not found. Please check and try again.", 'error', 4000);
        return;
      }

      // Send OTP if phone number exists
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
      console.error("Error in phone number verification:", error);
      showToast("❌ Something went wrong. Please try again.", 'error', 4000);
    } finally {
      setLoading(false);
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
                disabled={isLoading}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={loading || isLoading}>
          {(loading || isLoading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
      </form>
    </Form>
  );
}
