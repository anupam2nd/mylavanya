
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a valid number greater than 0",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits")
});

type OtpValues = z.infer<typeof otpSchema>;

interface NewJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  bookingNo: string;
  customerPhone: string;
  customerName: string;
  customerEmail: string;
  onJobCreated: () => void;
}

const NewJobDialog = ({
  open,
  onOpenChange,
  bookingId,
  bookingNo,
  customerPhone,
  customerName,
  customerEmail,
  onJobCreated
}: NewJobDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      price: "",
    },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const generateOtp = () => {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    return otp;
  };

  const sendOtp = async () => {
    const otp = generateOtp();
    setIsSubmitting(true);
    
    try {
      // In a real application, you would send this OTP to the customer's phone
      // For demonstration, we'll just log it and show a toast
      console.log(`OTP for customer ${customerName}: ${otp}`);
      
      toast.success(`OTP sent to ${customerName}'s phone`, {
        description: `For demo purposes, the OTP is: ${otp}`
      });
      
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async (values: OtpValues) => {
    setIsVerifying(true);
    
    try {
      // In a real application, you would verify this with a backend service
      // For now, we'll just compare with our generated OTP
      if (values.otp === generatedOtp) {
        await handleFormSubmit(form.getValues());
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create a job record in BookMST table with the 'new_job' status
      // FIX: Use a single object instead of an array for insert
      const { data, error } = await supabase
        .from("BookMST")
        .insert({
          Purpose: values.description,
          price: parseFloat(values.price),
          Status: "new_job",
          name: customerName,
          email: customerEmail,
          Phone_no: customerPhone,
          Booking_date: new Date().toISOString().split('T')[0],
          booking_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          // Reference to the original booking - ensure this is a number
          jobno: bookingId
        })
        .select();

      if (error) throw error;

      toast.success("New job created successfully");
      onOpenChange(false);
      onJobCreated();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    } finally {
      setIsSubmitting(false);
      setOtpSent(false);
      form.reset();
      otpForm.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Add a new job for booking #{bookingNo} - {customerName}
          </DialogDescription>
        </DialogHeader>

        {!otpSent ? (
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the job details" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter amount" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  disabled={isSubmitting || !form.formState.isValid} 
                  onClick={sendOtp}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP to Customer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...otpForm}>
            <form 
              className="space-y-4" 
              onSubmit={otpForm.handleSubmit(verifyOtp)}
            >
              <div className="text-center mb-6">
                <p className="font-medium text-gray-700">
                  OTP has been sent to customer
                </p>
                <p className="text-sm text-gray-500">
                  Please ask the customer to enter the 6-digit code
                </p>
              </div>

              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        {...field}
                        render={({ slots }) => (
                          <InputOTPGroup>
                            {slots.map((slot, i) => (
                              // FIX: Add the required index prop 
                              <InputOTPSlot key={i} {...slot} index={i} />
                            ))}
                          </InputOTPGroup>
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setOtpSent(false)}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isVerifying || !otpForm.formState.isValid}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Create Job"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewJobDialog;
