
import { useState } from "react";
import { format } from "date-fns";
import { BookingFormValues } from "./FormSchema";
import { toast } from "@/hooks/use-toast";
import { generateBookingReference, convertTo24HourFormat } from "./bookingUtils";
import { fetchServiceDetails, insertBookings } from "./bookingDatabase";

export const useBookingSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  const submitBooking = async (data: BookingFormValues) => {
    console.log("Starting booking submission with data:", data);
    setIsSubmitting(true);

    try {
      // Generate booking reference
      const bookingRef = await generateBookingReference();
      setBookingReference(bookingRef);
      console.log("Generated booking reference:", bookingRef);

      // Format phone, pincode, date and time
      const phoneNumber = data.phone.replace(/\D/g, "");
      const phoneNumberNum = Number(phoneNumber);
      const pincodeNum = data.pincode ? Number(data.pincode.replace(/\D/g, "")) : null;
      const bookingDate = format(data.selectedDate, "yyyy-MM-dd");
      
      // Ensure time is in 24-hour format for consistent database storage
      let timeValue = data.selectedTime || "09:00 AM";
      timeValue = convertTo24HourFormat(timeValue);
      const bookingTime = `${timeValue}:00+05:30`;
      
      // Make sure email is lowercase for database consistency
      const userEmail = data.email.toLowerCase();

      console.log("Prepared booking data:", {
        phoneNumberNum,
        pincodeNum,
        bookingDate,
        bookingTime,
        userEmail
      });

      // Fetch complete service details for each selected service
      const servicesWithDetails = await fetchServiceDetails(data.selectedServices);
      console.log("Services with details:", servicesWithDetails);

      // Insert bookings into BookMST
      await insertBookings({
        servicesWithDetails,
        bookingRef,
        data,
        bookingDate,
        bookingTime,
        phoneNumberNum,
        pincodeNum,
        userEmail
      });

      // Calculate total price
      const totalPrice = data.selectedServices.reduce((sum, service) =>
        sum + (service.price * (service.quantity || 1)), 0);

      // Show success notification
      toast({
        title: "Booking Successful!",
        description: `Your appointment has been scheduled.\nYour booking reference number is: ${bookingRef}\nTotal amount: ₹${totalPrice.toFixed(2)}\nNote: Your booking is not confirmed until payment is made.`,
        duration: 15000,
      });

      return { success: true, bookingRef };
    } catch (error) {
      console.error("Booking submission error:", error);

      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "There was an error processing your booking. Please try again.",
        variant: "destructive",
        duration: 8000,
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
