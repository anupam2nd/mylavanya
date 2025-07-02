
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PasswordResetFormProps {
  phoneNumber: string;
  onPasswordResetSuccess: () => void;
}

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function PasswordResetForm({ phoneNumber, onPasswordResetSuccess }: PasswordResetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Hash the password using the edge function
      const { data: hashResult, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: data.password }
      });
      
      if (hashError) {
        console.error('Error hashing password:', hashError);
        toast.error("Failed to update password");
        return;
      }
      
      if (!hashResult?.hashedPassword) {
        console.error('No hashed password returned from edge function');
        toast.error("Failed to update password");
        return;
      }
      
      // Update the password in the database for this phone number
      const { error } = await supabase
        .from('MemberMST')
        .update({ password: hashResult.hashedPassword })
        .eq('MemberPhNo', phoneNumber);
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      onPasswordResetSuccess();
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <div className="relative">
                <Input 
                  placeholder="Enter your new password" 
                  type={showPassword ? "text" : "password"}
                  className="pr-10" 
                  {...field} 
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
              <div className="relative">
                <Input 
                  placeholder="Confirm your new password" 
                  type={showConfirmPassword ? "text" : "password"}
                  className="pr-10" 
                  {...field} 
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating Password..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
}
