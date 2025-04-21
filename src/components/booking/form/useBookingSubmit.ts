
import { useState } from "react";
import { format } from "date-fns";
import { BookingFormValues } from "./FormSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useBookingSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  // Function to generate booking reference number
  const generateBookingReference = async (): Promise<string> => {
    // Format: YYMM + 4 digit running number using current date (not booking date)
    const currentDate = new Date();
    const yearMonth = format(currentDate, "yyMM");
    
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
      const fallbackYearMonth = format(new Date(), "yyMM");
      return `${fallbackYearMonth}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  };

  const submitBooking = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate booking reference using current date instead of booking date
      const bookingRef = await generateBookingReference();
      setBookingReference(bookingRef);
      
      console.log("Submitting booking with address details:", {
        services: data.selectedServices,
        bookingRef,
        date: format(data.selectedDate, "yyyy-MM-dd"),
        time: data.selectedTime,
        phone: data.phone,
        email: data.email,
        address: data.address,
        pincode: data.pincode,
        name: data.name
      });
      
      // Get service details for each selected service
      const serviceDetailsPromises = data.selectedServices.map(async (service) => {
        const { data: serviceData } = await supabase
          .from("PriceMST")
          .select("Services, Subservice, ProductName")
          .eq("prod_id", service.id)
          .single();
          
        return {
          ...service,
          serviceName: serviceData?.Services || "",
          subService: serviceData?.Subservice || "",
          productName: serviceData?.ProductName || ""
        };
      });
      
      const servicesWithDetails = await Promise.all(serviceDetailsPromises);
      
      // Get a default artist with an employee code for AssignedToEmpCode
      // Try multiple approaches to ensure we get a valid code
      let assignedToEmpCode = "UNASSIGNED";
      
      try {
        const { data: defaultArtist, error } = await supabase
          .from("ArtistMST")
          .select("ArtistEmpCode")
          .filter("ArtistEmpCode", "not.is", null)
          .eq("Active", true)
          .limit(1)
          .single();
        
        if (!error && defaultArtist && defaultArtist.ArtistEmpCode) {
          assignedToEmpCode = defaultArtist.ArtistEmpCode;
          console.log("Found default artist with code:", assignedToEmpCode);
        } else {
          // Fallback query if the first one fails
          const { data: anyArtist } = await supabase
            .from("ArtistMST")
            .select("ArtistEmpCode")
            .not("ArtistEmpCode", "is", null)
            .limit(1)
            .single();
            
          if (anyArtist?.ArtistEmpCode) {
            assignedToEmpCode = anyArtist.ArtistEmpCode;
            console.log("Found fallback artist code:", assignedToEmpCode);
          }
        }
      } catch (error) {
        console.warn("Error finding artist code, using default:", error);
      }
      
      // Insert multiple bookings with the same booking reference number
      // Add sequential job numbers for each service booked
      const bookingPromises = servicesWithDetails.map((service, index) => {
        // Clean the phone number to ensure it's only digits
        const phoneNumber = data.phone.replace(/\D/g, '');
        
        // Assign job number (1-based index)
        const jobNumber = index + 1;
        
        const bookingData = {
          Product: service.id,
          Purpose: service.name,
          Phone_no: parseInt(phoneNumber),
          Booking_date: format(data.selectedDate, "yyyy-MM-dd"),
          booking_time: data.selectedTime,
          Status: "pending",
          price: service.price,
          Booking_NO: bookingRef,
          Qty: service.quantity || 1,
          Address: data.address,
          Pincode: parseInt(data.pincode),
          name: data.name,
          email: data.email,
          ServiceName: service.serviceName,
          SubService: service.subService,
          ProductName: service.productName,
          jobno: jobNumber,
          AssignedToEmpCode: assignedToEmpCode // Ensure this is always set
        };
        
        console.log("Inserting booking with data:", bookingData);
        
        return supabase.from("BookMST").insert(bookingData);
      });
      
      const results = await Promise.all(bookingPromises);
      
      // Check if any insertions failed
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        console.error("Supabase booking errors:", errors.map(e => e.error));
        throw new Error("Failed to create some bookings");
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

  return {
    isSubmitting,
    submitBooking,
    bookingReference
  };
};
