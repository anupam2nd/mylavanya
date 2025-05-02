
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  bookingNo: string;
  customerPhone: string;
  customerName: string;
  customerEmail: string;
  onServiceAdded: () => void;
}

// Define form schemas
const serviceFormSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
});

const otpFormSchema = z.object({
  otp: z.string().length(4, "OTP must be exactly 4 digits"),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;
type OTPFormValues = z.infer<typeof otpFormSchema>;

const AddServiceDialog = ({
  open,
  onOpenChange,
  bookingId,
  bookingNo,
  customerPhone,
  customerName,
  customerEmail,
  onServiceAdded
}: AddServiceDialogProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<"service" | "otp" | "processing">("service");
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);

  // Form handling
  const serviceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceId: "",
    }
  });

  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    }
  });

  // Get services from PriceMST
  useEffect(() => {
    const fetchServices = async () => {
      if (!open) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("PriceMST")
          .select("*")
          .eq("active", true);

        if (error) throw error;

        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [open]);

  const handleServiceSelection = async (data: ServiceFormValues) => {
    try {
      setIsLoading(true);
      
      // Find the selected service
      const service = services.find(s => s.prod_id.toString() === data.serviceId);
      if (!service) {
        toast.error("Selected service not found");
        return;
      }
      
      setSelectedService(service);
      
      // Generate a 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOTP(otp);
      
      // In a real-world scenario, you'd send this OTP to the customer's phone
      console.log("Generated OTP:", otp);
      toast.info(`OTP: ${otp} (would be sent to customer's phone in production)`);
      
      // Move to OTP verification step
      setStep("otp");
    } catch (error) {
      console.error("Error selecting service:", error);
      toast.error("Failed to process service selection");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (data: OTPFormValues) => {
    try {
      setStep("processing");
      
      // In production, verify the OTP against what was sent to the customer
      if (data.otp !== generatedOTP) {
        toast.error("Invalid OTP. Please try again.");
        setStep("otp");
        return;
      }
      
      // Get the next job number
      let nextJobNo = 1;
      const { data: maxJobNoData } = await supabase
        .from("BookMST")
        .select("jobno")
        .eq("Booking_NO", bookingNo)
        .order("jobno", { ascending: false })
        .limit(1);
      
      if (maxJobNoData && maxJobNoData.length > 0 && maxJobNoData[0].jobno) {
        nextJobNo = maxJobNoData[0].jobno + 1;
      }

      // Get artist details
      let artistName = "Artist";
      if (user) {
        const { data: artistData } = await supabase
          .from("ArtistMST")
          .select("ArtistFirstName, ArtistLastName")
          .eq("ArtistId", parseInt(user.id, 10))
          .single();
          
        if (artistData) {
          artistName = `${artistData.ArtistFirstName || ''} ${artistData.ArtistLastName || ''}`.trim();
        }
      }
      
      // Fix the type error - convert string to number when using parseInt
      const phoneNumber = parseInt(customerPhone, 10);
      
      // Add the new service to BookMST
      const { error } = await supabase
        .from("BookMST")
        .insert({
          Booking_NO: parseInt(bookingNo, 10), // Convert string to number
          Purpose: selectedService.ProductName,
          Status: "start", // as specified in requirements
          name: customerName,
          email: customerEmail,
          Phone_no: phoneNumber, // Now using the parsed integer
          Booking_date: new Date().toISOString().split('T')[0],
          booking_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          jobno: nextJobNo,
          ArtistId: user ? parseInt(user.id, 10) : null,
          Assignedto: artistName,
          AssignedBY: user?.email || "",
          AssingnedON: new Date().toISOString(),
          ServiceName: selectedService.Services || "",
          SubService: selectedService.Subservice || "",
          ProductName: selectedService.ProductName || "",
          price: selectedService.Price || 0,
          Qty: 1
        });

      if (error) throw error;
      
      toast.success("Service added successfully!");
      onServiceAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Failed to add service");
    }
  };

  const resetDialog = () => {
    setStep("service");
    serviceForm.reset();
    otpForm.reset();
    setSelectedService(null);
    setGeneratedOTP("");
  };

  // Reset the form when dialog is closed
  useEffect(() => {
    if (!open) {
      resetDialog();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "service" ? "Add New Service" : 
             step === "otp" ? "Verify Customer OTP" :
             "Processing..."}
          </DialogTitle>
          <DialogDescription>
            {step === "service" ? 
              `Adding a new service to booking #${bookingNo} for ${customerName}` : 
              step === "otp" ? 
              "Please ask the customer to enter the OTP sent to their phone" :
              "Please wait while we process your request..."}
          </DialogDescription>
        </DialogHeader>
        
        {step === "service" && (
          <form onSubmit={serviceForm.handleSubmit(handleServiceSelection)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="service">Select Service</Label>
                <Controller
                  name="serviceId"
                  control={serviceForm.control}
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem 
                            key={service.prod_id} 
                            value={service.prod_id.toString()}
                          >
                            {service.ProductName} - ₹{service.Price || 0}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {serviceForm.formState.errors.serviceId && (
                  <p className="text-sm text-destructive">{serviceForm.formState.errors.serviceId.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
        
        {step === "otp" && (
          <form onSubmit={otpForm.handleSubmit(verifyOTP)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">Enter 4-digit OTP</Label>
                <div className="flex justify-center">
                  <Controller
                    name="otp"
                    control={otpForm.control}
                    render={({ field }) => (
                      <InputOTP maxLength={4} {...field}>
                        <InputOTPGroup>
                          {[0, 1, 2, 3].map((index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    )}
                  />
                </div>
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-center text-destructive">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Adding: {selectedService?.ProductName} - ₹{selectedService?.Price || 0}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setStep("service")}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Add Service"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
        
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-center text-muted-foreground">
              Adding service to booking...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceDialog;
