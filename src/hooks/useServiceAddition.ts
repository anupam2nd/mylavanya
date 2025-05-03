
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceAdditionProps {
  bookingId: number;
  bookingNo: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  onServiceAdded: () => void;
  onClose: () => void;
}

export const useServiceAddition = ({
  bookingId,
  bookingNo,
  customerName,
  customerPhone,
  customerEmail,
  onServiceAdded,
  onClose,
}: ServiceAdditionProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<"service" | "otp" | "processing">("service");
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingAddress, setBookingAddress] = useState<string | null>(null);
  const [bookingPincode, setBookingPincode] = useState<number | null>(null);

  const fetchServices = async () => {
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

  const fetchBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("BookMST")
        .select("Address, Pincode")
        .eq("id", bookingId)
        .single();

      if (error) {
        console.error("Error fetching booking details:", error);
        return;
      }

      if (data) {
        setBookingAddress(data.Address || null);
        setBookingPincode(data.Pincode ? Number(data.Pincode) : null);
        console.log("Fetched original booking address:", data.Address);
        console.log("Fetched original booking pincode:", data.Pincode);
      }
    } catch (error) {
      console.error("Error in fetchBookingDetails:", error);
    }
  };

  const handleServiceSelection = async (serviceId: string) => {
    try {
      setIsLoading(true);
      
      // Find the selected service
      const service = services.find(s => s.prod_id.toString() === serviceId);
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

  const verifyOTP = async (otpValue: string) => {
    try {
      setStep("processing");
      
      // In production, verify the OTP against what was sent to the customer
      if (otpValue !== generatedOTP) {
        toast.error("Invalid OTP. Please try again.");
        setStep("otp");
        return;
      }
      
      // Get the next job number
      let nextJobNo = 1;
      const { data: maxJobNoData } = await supabase
        .from("BookMST")
        .select("jobno")
        .eq("Booking_NO", parseInt(bookingNo, 10))
        .order("jobno", { ascending: false })
        .limit(1);
      
      if (maxJobNoData && maxJobNoData.length > 0 && maxJobNoData[0].jobno) {
        nextJobNo = maxJobNoData[0].jobno + 1;
      }

      // Get artist details
      let artistName = "Artist";
      let artistEmpCode = "";
      if (user) {
        const { data: artistData } = await supabase
          .from("ArtistMST")
          .select("ArtistFirstName, ArtistLastName, ArtistEmpCode")
          .eq("ArtistId", parseInt(user.id, 10))
          .single();
          
        if (artistData) {
          artistName = `${artistData.ArtistFirstName || ''} ${artistData.ArtistLastName || ''}`.trim();
          artistEmpCode = artistData.ArtistEmpCode || '';
        }
      }
      
      // Convert phone string to number if possible, otherwise use 0
      const phoneNumber = customerPhone ? parseInt(customerPhone, 10) : 0;
      
      const bookingNoAsNumber = parseInt(bookingNo, 10);
      
      // Add the new service to BookMST
      const { error } = await supabase
        .from("BookMST")
        .insert({
          Booking_NO: bookingNoAsNumber,
          Purpose: selectedService.ProductName,
          Status: "start", // as specified in requirements
          name: customerName,
          email: customerEmail,
          Phone_no: phoneNumber,
          Booking_date: new Date().toISOString().split('T')[0],
          booking_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          jobno: nextJobNo,
          ArtistId: user ? parseInt(user.id, 10) : null,
          Assignedto: artistName,
          AssignedBY: artistName, // Artist is adding the service
          AssingnedON: new Date().toISOString(),
          ServiceName: selectedService.Services || "",
          SubService: selectedService.Subservice || "",
          ProductName: selectedService.ProductName || "",
          AssignedToEmpCode: artistEmpCode, // Artist emp code from ArtistMST
          price: selectedService.Price || 0,
          StatusUpdated: new Date().toISOString(), // When the service is added
          Qty: 1,
          // Important: Include the address and pincode from the original booking
          Address: bookingAddress,
          Pincode: bookingPincode
        });

      if (error) throw error;
      
      toast.success("Service added successfully!");
      onServiceAdded();
      onClose();
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Failed to add service");
    }
  };

  const resetDialog = () => {
    setStep("service");
    setSelectedService(null);
    setGeneratedOTP("");
    setBookingAddress(null);
    setBookingPincode(null);
  };

  return {
    step,
    services,
    isLoading,
    selectedService,
    generatedOTP,
    setStep,
    fetchServices,
    fetchBookingDetails,
    handleServiceSelection,
    verifyOTP,
    resetDialog
  };
};
