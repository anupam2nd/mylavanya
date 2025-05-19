
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
  onSuccess: (phone: string) => void;
}

export default function ForgotPassword({ isOpen, onClose, onSuccess }: ForgotPasswordProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [forgotStep, setForgotStep] = useState<"phone" | "otp" | "reset">("phone");
  const [otp, setOtp] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [verifiedMemberId, setVerifiedMemberId] = useState<string | null>(null);

  const resetForm = useForm<z.infer<typeof resetFormSchema>>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const handleForgotPasswordSubmit = async () => {
    if (forgotStep === "phone") {
      if (!phoneNumber.trim() || phoneNumber.length !== 10) {
        toast.error("Please enter a valid 10-digit phone number");
        return;
      }
      
      setResetLoading(true);
      try {
        // Check if phone number exists in MemberMST
        const { data, error } = await supabase
          .from('MemberMST')
          .select('id, MemberPhNo')
          .eq('MemberPhNo', phoneNumber.trim())
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          toast.error("No account found with this phone number");
          return;
        }

        // Store the member ID for later use when updating password
        setVerifiedMemberId(data.id.toString());
        
        // Send OTP via Supabase Edge Function
        const response = await supabase.functions.invoke("send-registration-otp", {
          body: { phoneNumber }
        });

        if (response.error) {
          toast.error("Failed to send OTP. Please try again.");
          console.error("Error sending OTP:", response.error);
          return;
        }
        
        toast.success("OTP sent successfully!");
        setForgotStep("otp");
      } catch (error) {
        console.error("Error in password reset:", error);
        toast.error("Error processing your request");
      } finally {
        setResetLoading(false);
      }
    } else if (forgotStep === "otp") {
      setResetLoading(true);
      try {
        // Verify the OTP
        const response = await supabase.functions.invoke("verify-registration-otp", {
          body: { phoneNumber, otp }
        });
        
        if (response.error || !response.data.success) {
          toast.error(response.error?.message || response.data?.error || "Invalid OTP");
          return;
        }
        
        setForgotStep("reset");
      } catch (error) {
        console.error("Error verifying OTP:", error);
        toast.error("Error verifying OTP");
      } finally {
        setResetLoading(false);
      }
    }
  };

  const handlePasswordReset = async (values: z.infer<typeof resetFormSchema>) => {
    if (!verifiedMemberId) {
      toast.error("Verification error. Please try again.");
      return;
    }

    setResetLoading(true);
    try {
      // Update password in the database for the verified member
      const { error } = await supabase
        .from('MemberMST')
        .update({ password: values.password })
        .eq('id', verifiedMemberId);
        
      if (error) {
        throw error;
      }
      
      toast.success("Password Reset Successfully", { 
        description: "Your password has been successfully reset. You can now log in with your new password." 
      });
      
      onClose();
      setForgotStep("phone");
      setOtp("");
      resetForm.reset();
      
      // Pass phone number back to parent for auto-fill
      onSuccess(phoneNumber);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Error updating your password");
    } finally {
      setResetLoading(false);
    }
  };

  // Close handler to reset the form state
  const handleClose = () => {
    setForgotStep("phone");
    setPhoneNumber("");
    setOtp("");
    resetForm.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {forgotStep === "phone" ? "Reset Password" : 
             forgotStep === "otp" ? "Enter OTP" : "Create New Password"}
          </DialogTitle>
          <DialogDescription>
            {forgotStep === "phone" ? "Enter your phone number to receive a one-time password" : 
             forgotStep === "otp" ? "Enter the OTP sent to your phone number" : 
             "Create a new password that meets the requirements below"}
          </DialogDescription>
        </DialogHeader>

        {forgotStep === "phone" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-phone">Phone Number</Label>
              <Input 
                id="reset-phone" 
                type="tel" 
                placeholder="Enter your 10-digit phone number" 
                value={phoneNumber}
                maxLength={10}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <Button 
              className="w-full bg-pink-500 hover:bg-pink-600" 
              onClick={handleForgotPasswordSubmit}
              disabled={resetLoading || phoneNumber.length !== 10}
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
              className="w-full bg-pink-500 hover:bg-pink-600" 
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
                className="w-full bg-pink-500 hover:bg-pink-600"
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
