
import { useState } from "react";
import { BookingFormValues } from "./FormSchema";
import { toast } from "@/components/ui/use-toast";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { generateBookingReference } from "@/utils/booking/referenceGenerator";
import { getNextAvailableId } from "@/utils/booking/idGenerator";
import { createBookingEntries } from "@/utils/booking/bookingCreator";

export const useBookingSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const { formattedStatusOptions, statusOptions } = useStatusOptions();

  const submitBooking = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate booking reference using current date instead of booking date
      const bookingRef = await generateBookingReference();
      setBookingReference(bookingRef);
      
      console.log("Submitting booking with address details:", {
        services: data.selectedServices,
        bookingRef,
        date: data.selectedDate,
        time: data.selectedTime,
        phone: data.phone,
        email: data.email,
        address: data.address,
        pincode: data.pincode,
        name: data.name
      });
      
      // Get the next available ID for new bookings
      const nextId = await getNextAvailableId();
      
      // Get status name (default to "Pending")
      const statusName = getStatusName("pending");
      
      const result = await createBookingEntries(data, bookingRef, nextId, statusName);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create bookings");
      }

      // Calculate total price including quantities
      const totalPrice = data.selectedServices.reduce((sum, service) => 
        sum + (service.price * (service.quantity || 1)), 0);
      
      // Create a toast without JSX
      toast({
        title: "Booking Successful!",
        description: `Your appointment has been scheduled.\nYour booking reference number is: ${bookingRef}\nTotal amount: ₹${totalPrice.toFixed(2)}\nNote: Your booking is not confirmed until payment is made.`,
        duration: 15000,
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
  
  // Get the status name for use in bookings
  const getStatusName = (statusCode: string = "pending"): string => {
    // Default to "Pending" status name if no match or no options available
    if (!statusOptions || statusOptions.length === 0) {
      console.log("No status options available, using default 'Pending'");
      return "Pending";
    }
    
    // Find the matching status option
    const statusOption = statusOptions.find(
      option => option.status_code.toLowerCase() === statusCode.toLowerCase()
    );
    
    // Return the status name or default to "Pending"
    return statusOption ? statusOption.status_name : "Pending";
  };

  return {
    isSubmitting,
    submitBooking,
    bookingReference
  };
};
