
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useMemberLogin } from "@/hooks/useMemberLogin";

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface SupabaseMemberLoginFormProps {
  onLoginSuccess: () => void;
}

export default function SupabaseMemberLoginForm({ onLoginSuccess }: SupabaseMemberLoginFormProps) {
  const { handleLogin, isLoading } = useMemberLogin();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const success = await handleLogin({
      emailOrPhone: values.emailOrPhone,
      password: values.password,
    }, false);
    
    if (success) {
      onLoginSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="emailOrPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your email or phone number" 
                  {...field}
                  onChange={(e) => {
                    // Allow only numbers for phone input or email format
                    const value = e.target.value;
                    if (value.includes('@') || /^\d*$/.test(value)) {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <ButtonCustom
          type="submit"
          variant="primary-gradient"
          className="w-full"
          disabled={isLoading}
          isLoading={isLoading}
        >
          Sign In
        </ButtonCustom>
      </form>
    </Form>
  );
}
