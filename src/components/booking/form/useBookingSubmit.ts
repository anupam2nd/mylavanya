import { useState } from "react";
import { format } from "date-fns";
import { BookingFormValues } from "./FormSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useBookingSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  const generateBookingReference = async (): Promise<string> => {
    const currentDate = new Date();
    const yearMonth = format(currentDate, "yyMM");
    
    try {
      const { data } = await supabase
        .from("BookMST")
        .select("Booking_NO")
        .like("Booking_NO", `${yearMonth}%`)
        .order("Booking_NO", { ascending: false })
        .limit(1);
      
      let runningNumber = 1;
      
      if (data && data.length > 0 && data[0].Booking_NO) {
        const lastRef = data[0].Booking_NO;
        const lastNumber = parseInt(lastRef.substring(4), 10);
        runningNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
      }
      
      const formattedNumber = runningNumber.toString().padStart(4, '0');
      return `${yearMonth}${formattedNumber}`;
    } catch (error) {
      console.error("Error generating booking reference:", error);
      const fallbackYearMonth = format(new Date(), "yyMM");
      return `${fallbackYearMonth}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  };

  // Standardize time format to HH:MM 24-hour format
  const convertTo24HourFormat = (time12h: string): string => {
    console.log("Converting time input:", time12h);
    
    // If already in 24-hour format (HH:MM), return as is
    if (time12h.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      console.log("Time already in 24-hour format:", time12h);
      return time12h;
    }
    
    try {
      // Handle AM/PM format
      const [timePart, period] = time12h.split(' ');
      
      if (!timePart || !period) {
        console.error("Invalid time format (missing parts):", time12h);
        return "09:00"; // Default to 9 AM if parsing fails
      }
      
      const [hoursStr, minutesStr] = timePart.split(':');
      
      if (!hoursStr || !minutesStr) {
        console.error("Invalid time format (missing hours/minutes):", time12h);
        return "09:00"; // Default to 9 AM if parsing fails
      }
      
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        console.error("Invalid time values:", { hours, minutes });
        return "09:00"; // Default to 9 AM if parsing fails
      }
      
      // Convert 12-hour format to 24-hour
      if (period.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      console.log("Converted time:", formattedTime);
      return formattedTime;
    } catch (error) {
      console.error("Error parsing time:", error);
      return "09:00"; // Default to 9 AM if parsing fails
    }
  };

  const submitBooking = async (data: BookingFormValues) => {
    console.log("Starting booking submission with data:", data);
    setIsSubmitting(true);
    
    try {
      // Log all database field names to debug
      console.log("Checking database schema of BookMST table...");
      
      // Generate booking reference
      const bookingRef = await generateBookingReference();
      setBookingReference(bookingRef);
      console.log("Generated booking reference:", bookingRef);
      
      // Format phone and pincode
      const phoneNumber = data.phone.replace(/\D/g, "");
      const phoneNumberNum = Number(phoneNumber);
      const pincodeNum = data.pincode ? Number(data.pincode.replace(/\D/g, "")) : null;
      
      // Format date
      const bookingDate = format(data.selectedDate, "yyyy-MM-dd");
      
      // Format time
      let timeValue = data.selectedTime || "09:00 AM";
      timeValue = convertTo24HourFormat(timeValue);
      const bookingTime = `${timeValue}:00+05:30`;
      
      // User email - ensure lowercase
      const userEmail = data.email.toLowerCase();
      
      console.log("Booking details:", {
        ref: bookingRef,
        date: bookingDate,
        time: bookingTime,
        email: userEmail,
        phone: phoneNumberNum,
        name: data.name
      });

      // Fetch service details for each selected service
      const serviceDetailsPromises = data.selectedServices.map(async (service) => {
        const { data: serviceData, error: serviceError } = await supabase
          .from("PriceMST")
          .select("Services, Subservice, ProductName")
          .eq("prod_id", service.id)
          .single();
          
        if (serviceError) {
          console.error("Error fetching service details:", serviceError);
          throw serviceError;
        }
          
        return {
          ...service,
          serviceName: serviceData?.Services || "",
          subService: serviceData?.Subservice || "",
          productName: serviceData?.ProductName || ""
        };
      });
      
      const servicesWithDetails = await Promise.all(serviceDetailsPromises);
      console.log("Service details fetched:", servicesWithDetails);
      
      // Create booking records for each service
      const bookingPromises = servicesWithDetails.map((service, index) => {
        const jobNumber = index + 1;
        
        // Create a booking object with the email field set as "email" (lowercase) only
        // and avoid setting the Email (capitalized) field
        const bookingData = {
          Product: Number(service.id) || null,
          Purpose: service.name,
          Phone_no: phoneNumberNum,
          Booking_date: bookingDate,
          booking_time: bookingTime,
          Status: "pending",
          price: service.price,
          Booking_NO: bookingRef,
          Qty: service.quantity || 1,
          Address: data.address,
          Pincode: pincodeNum,
          name: data.name,
          email: userEmail,  // Only use lowercase version
          ServiceName: service.serviceName,
          SubService: service.subService,
          ProductName: service.productName,
          jobno: jobNumber
        };
        
        console.log(`Preparing booking data for service #${index + 1}:`, bookingData);
        
        return supabase
          .from("BookMST")
          .insert(bookingData);
      });
      
      // Execute all bookings in parallel
      console.log("Submitting bookings to database...");
      const results = await Promise.all(bookingPromises);
      
      // Check for errors
      let hasErrors = false;
      let errorDetails = [];
      
      results.forEach((result, idx) => {
        if (result.error) {
          console.error(`Error for booking #${idx + 1}:`, result.error);
          errorDetails.push({
            index: idx,
            message: result.error.message,
            details: result.error
          });
          hasErrors = true;
        } else {
          console.log(`Success for booking #${idx + 1}:`, result);
        }
      });
      
      if (hasErrors) {
        console.error("Booking errors:", errorDetails);
        throw new Error(`Failed to create booking(s): ${errorDetails.map(e => e.message).join(', ')}`);
      }

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
