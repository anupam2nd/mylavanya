
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface PhoneNumberFormProps {
  onSubmit: (phoneNumber: string) => void;
  isLoading?: boolean;
}

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(10, "Phone number must be 10 digits"),
});

export function PhoneNumberForm({ onSubmit, isLoading = false }: PhoneNumberFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('PhoneNumberForm submitting phone:', data.phoneNumber);
    onSubmit(data.phoneNumber);
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
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending OTP..." : "Send OTP"}
        </Button>
      </form>
    </Form>
  );
}
