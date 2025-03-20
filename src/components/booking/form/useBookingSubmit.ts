
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
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  // Function to generate booking reference number
  const generateBookingReference = async (bookingDate: Date): Promise<string> => {
    // Format: YYMM + 4 digit running number
    const yearMonth = format(bookingDate, "yyMM");
    
    try {
      // Get the latest booking with this year-month prefix
      const { data } = await supabase
        .from("BookMST")
        .select("Booking_NO")
        .like("Booking_NO", `${yearMonth}%`)
        .order("Booking_NO", { ascending: false })
        .limit(1);
      
      let runningNumber = 1;
      
      // If there are existing bookings with this prefix, increment the last one
      if (data && data.length > 0 && data[0].Booking_NO) {
        const lastRef = data[0].Booking_NO;
        const lastNumber = parseInt(lastRef.substring(4), 10);
        runningNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
      }
      
      // Format running number as 4 digits with leading zeros
      const formattedNumber = runningNumber.toString().padStart(4, '0');
      return `${yearMonth}${formattedNumber}`;
    } catch (error) {
      console.error("Error generating booking reference:", error);
      // Fallback to timestamp-based reference if database query fails
      return `${yearMonth}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  };

  const submitBooking = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    try {
      const bookingDate = new Date(data.date);
      const bookingRef = await generateBookingReference(bookingDate);
      setBookingReference(bookingRef);
      
      console.log("Submitting booking:", {
        Product: serviceId,
        Purpose: serviceName,
        Phone_no: parseInt(data.phone), 
        Booking_date: format(data.date, "yyyy-MM-dd"),
        booking_time: data.time,
        Status: "pending",
        price: servicePrice,
        Booking_NO: bookingRef
      });
      
      const { error } = await supabase.from("BookMST").insert({
        Product: serviceId,
        Purpose: serviceName,
        Phone_no: parseInt(data.phone),
        Booking_date: format(data.date, "yyyy-MM-dd"),
        booking_time: data.time,
        Status: "pending",
        price: servicePrice,
        Booking_NO: bookingRef
      });

      if (error) {
        console.error("Supabase booking error:", error);
        throw error;
      }

      toast({
        title: "Booking Successful!",
        description: `Your appointment for ${serviceName} has been scheduled. Your booking reference number is ${bookingRef}. Please note it down for future reference.`,
        duration: 10000,
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        onCancel && onCancel();
      }
      
      return { success: true, bookingRef };
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
      return { success: false, bookingRef: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitBooking,
    bookingReference
  };
};
