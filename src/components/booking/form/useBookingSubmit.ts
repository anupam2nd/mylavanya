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

  const submitBooking = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    try {
      const bookingRef = await generateBookingReference();
      setBookingReference(bookingRef);
      
      const phoneNumber = data.phone.replace(/\D/g, "");
      const phoneNumberNum = Number(phoneNumber);
      const pincodeNum = data.pincode ? Number(data.pincode.replace(/\D/g, "")) : null;
      const bookingDate = format(data.selectedDate, "yyyy-MM-dd");
      let bookingTime = data.selectedTime || "09:00";
      if (!bookingTime.match(/([+-][0-9]{2}:[0-9]{2})$/)) {
        bookingTime = `${bookingTime}:00+05:30`;
      }

      console.log("Attempting to insert bookings with values:", {
        ...data,
        phoneNumber,
        phoneNumberNum,
        pincodeNum,
        bookingRef,
        bookingTime,
        bookingDate,
      });

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
      
      const bookingPromises = servicesWithDetails.map((service, index) => {
        const jobNumber = index + 1;
        
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
          email: data.email,
          ServiceName: service.serviceName,
          SubService: service.subService,
          ProductName: service.productName,
          jobno: jobNumber
        };
        
        console.log(`Inserting row [${index + 1}]:`, bookingData);
        return supabase
          .from("BookMST")
          .insert(bookingData)
          .select();
      });
      
      const results = await Promise.all(bookingPromises);
      
      results.forEach((result, idx) => {
        if (result.error) {
          console.error("Insert error for booking #", idx + 1, ":", result.error, result);
        } else {
          console.log("Insert success for booking #", idx + 1, result);
        }
      });
      
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        console.error("Supabase booking errors:", errors.map(e => e.error));
        throw new Error("Failed to create some bookings");
      }

      const totalPrice = data.selectedServices.reduce((sum, service) => 
        sum + (service.price * (service.quantity || 1)), 0);
      
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

  return {
    isSubmitting,
    submitBooking,
    bookingReference
  };
};
