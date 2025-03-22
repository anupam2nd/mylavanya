import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonCustom } from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
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
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", loginData.email);
      // Explicitly convert email to lowercase for consistent matching
      const email = loginData.email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('UserMST')
        .select('id, Username, role')
        .ilike('Username', email)
        .eq('password', loginData.password)
        .maybeSingle();
      
      console.log("Query result:", data, error);
      
      if (error) {
        console.error("Supabase query error:", error);
        throw new Error('Error querying user');
      }
      
      if (!data) {
        throw new Error('Invalid credentials');
      }
      
      // Login using the context function
      login({
        id: data.id.toString(),
        email: data.Username,
        role: data.role
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back! You are now logged in as ${data.role}.`,
      });
      
      // Redirect based on role
      if (data.role === 'superadmin' || data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      setForgotPasswordOpen(false);
      setForgotStep("email");
      setOtp("");
      resetForm.reset();
      
      // Pre-fill the email field in the login form
      setLoginData(prev => ({ ...prev, email: forgotEmail }));
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({ title: "Reset Failed", description: "Error updating your password", variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };
  
  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-login">Email</Label>
          <Input 
            id="email-login" 
            type="email" 
            placeholder="Your email address" 
            value={loginData.email}
            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password-login">Password</Label>
            <Button 
              type="button"
              variant="link" 
              className="p-0 h-auto text-xs"
              onClick={() => setForgotPasswordOpen(true)}
            >
              Forgot password?
            </Button>
          </div>
          <Input 
            id="password-login" 
            type="password" 
            placeholder="Your password" 
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            required
          />
        </div>
        <ButtonCustom 
          variant="primary-gradient" 
          className="w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </ButtonCustom>
      </form>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
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
    </>
  );
}
