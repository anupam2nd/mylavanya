
import { useState } from "react";
import { format } from "date-fns";
import { BookingFormValues } from "./FormSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface UseBookingSubmitProps {
  serviceId: number;
  serviceName: string;
  servicePrice?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const useBookingSubmit = ({
  serviceId,
  serviceName,
  servicePrice,
  onSuccess,
  onCancel
}: UseBookingSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitBooking = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting booking:", {
        Product: serviceId,
        Purpose: serviceName,
        Phone_no: parseInt(data.phone), // Convert string to number
        Booking_date: format(data.date, "yyyy-MM-dd"),
        booking_time: data.time,
        Status: "pending",
        price: servicePrice
      });
      
      const { error } = await supabase.from("BookMST").insert({
        Product: serviceId,
        Purpose: serviceName,
        Phone_no: parseInt(data.phone), // Convert string to number
        Booking_date: format(data.date, "yyyy-MM-dd"),
        booking_time: data.time,
        Status: "pending",
        price: servicePrice
      });

      if (error) {
        console.error("Supabase booking error:", error);
        throw error;
      }

      toast({
        title: "Booking Successful!",
        description: `Your appointment for ${serviceName} has been scheduled.`,
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        onCancel && onCancel();
      }
      
      return true;
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitBooking
  };
};
