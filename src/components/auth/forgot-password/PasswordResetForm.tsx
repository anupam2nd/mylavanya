
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";

interface PasswordResetFormProps {
  phoneNumber: string;
  onPasswordResetSuccess: () => void;
}

const formSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export function PasswordResetForm({ phoneNumber, onPasswordResetSuccess }: PasswordResetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useCustomToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      console.log('Starting password reset for member with phone:', phoneNumber);
      
      // Hash the password using the edge function
      const { data: hashResult, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: data.password }
      });
      
      if (hashError) {
        console.error('Error hashing password:', hashError);
        showToast("❌ Failed to update password. Please try again.", 'error', 4000);
        return;
      }
      
      if (!hashResult?.hashedPassword) {
        console.error('No hashed password returned from edge function');
        showToast("❌ Failed to update password. Please try again.", 'error', 4000);
        return;
      }
      
      console.log('Password hashed successfully, updating database');
      
      // Update password in MemberMST table with the hashed password
      const { error } = await supabase
        .from('MemberMST')
        .update({ password: hashResult.hashedPassword })
        .eq('MemberPhNo', phoneNumber);

      if (error) {
        console.error('Error updating password in database:', error);
        throw error;
      }

      console.log('Password updated successfully in database');
      showToast("🎉 Password updated successfully! You can now login with your new password.", 'success', 5000);
      onPasswordResetSuccess();
    } catch (error) {
      console.error("Error updating password:", error);
      showToast("❌ Failed to update password. Please try again.", 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password" 
                    {...field} 
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Confirm new password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-1 text-sm">
          <p className="font-medium">Password requirements:</p>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Minimum 8 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one number</li>
            <li>At least one special character</li>
          </ul>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Updating Password..." : "Update Password"}
        </Button>
      </form>
    </Form>
  );
}
