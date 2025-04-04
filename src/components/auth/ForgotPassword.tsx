
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const resetFormSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function ForgotPassword({ isOpen, onClose, onSuccess }: ForgotPasswordProps) {
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const resetForm = useForm<z.infer<typeof resetFormSchema>>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const handleForgotPasswordSubmit = async () => {
    if (forgotStep === "email") {
      if (!forgotEmail.trim()) {
        toast({ title: "Email Required", description: "Please enter your email address", variant: "destructive" });
        return;
      }
      
      setResetLoading(true);
      try {
        // Check if user exists
        const { data, error } = await supabase
          .from('UserMST')
          .select('id, Username')
          .ilike('Username', forgotEmail.trim().toLowerCase())
          .maybeSingle();
          
        if (error || !data) {
          toast({ title: "Account Not Found", description: "No account found with this email address", variant: "destructive" });
          return;
        }

        // Generate a random 6-digit OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP temporarily in localStorage (in a real app, this would be sent via email)
        localStorage.setItem(`otp_${forgotEmail}`, generatedOtp);
        
        // In a real application, you would send this OTP via email
        // For demo purposes, we'll show it in a toast
        toast({ 
          title: "OTP Generated", 
          description: `Your OTP is: ${generatedOtp} (In a real app, this would be sent to your email)` 
        });
        
        setForgotStep("otp");
      } catch (error) {
        console.error("Error in password reset:", error);
        toast({ title: "Reset Failed", description: "Error processing your request", variant: "destructive" });
      } finally {
        setResetLoading(false);
      }
    } else if (forgotStep === "otp") {
      setResetLoading(true);
      try {
        // Verify the OTP
        const storedOtp = localStorage.getItem(`otp_${forgotEmail}`);
        
        if (otp !== storedOtp) {
          toast({ title: "Invalid OTP", description: "The OTP you entered is incorrect", variant: "destructive" });
          return;
        }
        
        setForgotStep("reset");
      } catch (error) {
        console.error("Error verifying OTP:", error);
        toast({ title: "Verification Failed", description: "Error verifying OTP", variant: "destructive" });
      } finally {
        setResetLoading(false);
      }
    }
  };

  const handlePasswordReset = async (values: z.infer<typeof resetFormSchema>) => {
    setResetLoading(true);
    try {
      // Update password in the database
      const { error } = await supabase
        .from('UserMST')
        .update({ password: values.password })
        .ilike('Username', forgotEmail);
        
      if (error) {
        throw error;
      }
      
      // Clear the stored OTP
      localStorage.removeItem(`otp_${forgotEmail}`);
      
      toast({ title: "Password Reset", description: "Your password has been successfully reset. You can now log in with your new password." });
      onClose();
      setForgotStep("email");
      setOtp("");
      resetForm.reset();
      
      // Pass email back to parent for auto-fill
      onSuccess(forgotEmail);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({ title: "Reset Failed", description: "Error updating your password", variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  // Close handler to reset the form state
  const handleClose = () => {
    setForgotStep("email");
    setOtp("");
    resetForm.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {forgotStep === "email" ? "Reset Password" : 
             forgotStep === "otp" ? "Enter OTP" : "Create New Password"}
          </DialogTitle>
          <DialogDescription>
            {forgotStep === "email" ? "Enter your email to receive a one-time password" : 
             forgotStep === "otp" ? "Enter the OTP sent to your email" : 
             "Create a new password that meets the requirements below"}
          </DialogDescription>
        </DialogHeader>

        {forgotStep === "email" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="Enter your email address" 
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleForgotPasswordSubmit}
              disabled={resetLoading}
            >
              {resetLoading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        )}

        {forgotStep === "otp" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Label htmlFor="otp-input">One-Time Password</Label>
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={setOtp}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleForgotPasswordSubmit}
              disabled={resetLoading || otp.length !== 6}
            >
              {resetLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        )}

        {forgotStep === "reset" && (
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
              <FormField
                control={resetForm.control}
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
                control={resetForm.control}
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
                className="w-full"
                disabled={resetLoading}
              >
                {resetLoading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
