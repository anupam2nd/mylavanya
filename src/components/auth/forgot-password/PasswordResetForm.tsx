
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { passwordResetSchema } from "./schemas";

interface PasswordResetFormProps {
  isLoading: boolean;
  onSubmit: (values: z.infer<typeof passwordResetSchema>) => Promise<void>;
}

export default function PasswordResetForm({ isLoading, onSubmit }: PasswordResetFormProps) {
  const form = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter new password" 
                  {...field} 
                />
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
              <FormLabel>Confirm Password</FormLabel>
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
          <p className="font-medium">Password must:</p>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Be at least 8 characters long</li>
            <li>Include at least one uppercase letter</li>
            <li>Include at least one lowercase letter</li>
            <li>Include at least one number</li>
            <li>Include at least one special character</li>
          </ul>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-pink-500 hover:bg-pink-600"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
}
