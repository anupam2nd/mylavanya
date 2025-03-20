
import { useState } from "react";
import { format } from "date-fns";
import { BookingFormValues } from "./FormSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useBookingSubmit = () => {
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
      
      console.log("Submitting booking with address details:", {
        services: data.selectedServices,
        bookingRef,
        date: format(data.date, "yyyy-MM-dd"),
        time: data.time,
        phone: data.phone,
        address: data.address,
        pincode: data.pincode,
        name: data.name
      });
      
      // Insert multiple bookings with the same booking reference number
      const bookingPromises = data.selectedServices.map(service => {
        return supabase.from("BookMST").insert({
          Product: service.id,
          Purpose: service.name,
          Phone_no: parseInt(data.phone.replace(/\D/g, '')),
          Booking_date: format(data.date, "yyyy-MM-dd"),
          booking_time: data.time,
          Status: "pending",
          price: service.price,
          Booking_NO: bookingRef,
          Qty: service.quantity || 1,
          Address: data.address,
          Pincode: parseInt(data.pincode),
          name: data.name
        });
      });
      
      const results = await Promise.all(bookingPromises);
      
      // Check if any insertions failed
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        console.error("Supabase booking errors:", errors);
        throw new Error("Failed to create some bookings");
      }

      // Calculate total price including quantities
      const totalPrice = data.selectedServices.reduce((sum, service) => 
        sum + (service.price * (service.quantity || 1)), 0);
      
      toast({
        title: "Booking Successful!",
        description: `Your appointment has been scheduled. Your booking reference number is ${bookingRef}. Total amount: ₹${totalPrice.toFixed(2)}`,
        duration: 10000,
      });
      
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
