
import { format } from "date-fns";
import { BookingFormValues } from "@/components/booking/form/FormSchema";
import { supabase } from "@/integrations/supabase/client";

interface ServiceWithDetails {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  serviceName: string;
  subService: string;
  productName: string;
}

interface BookingResult {
  success: boolean;
  error?: string;
}

export const createBookingEntries = async (
  data: BookingFormValues, 
  bookingRef: string, 
  nextId: number, 
  statusName: string
): Promise<BookingResult> => {
  try {
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
    const currentTime = new Date();
    
    // Insert multiple bookings with the same booking reference number
    // Add sequential job numbers for each service booked
    const bookingPromises = servicesWithDetails.map((service, index) => {
      // Clean the phone number to ensure it's only digits
      const phoneNumber = data.phone.replace(/\D/g, '');
      
      // Assign job number (1-based index)
      const jobNumber = index + 1;
      
      // Create the booking object with all needed fields
      const bookingData: Record<string, any> = {
        id: nextId + index, // Use incrementing IDs starting from the next available ID
        Product: service.id, // Keep using Product field for compatibility with database
        Purpose: service.name,
        Phone_no: parseInt(phoneNumber),
        Booking_date: format(data.selectedDate, "yyyy-MM-dd"),
        booking_time: data.selectedTime,
        Status: statusName, // Use status name instead of code for readability
        StatusUpdated: currentTime, // Set initial status update time
        price: service.price,
        Booking_NO: bookingRef, // Store booking reference as string, not number
        Qty: service.quantity || 1,
        Address: data.address,
        Pincode: parseInt(data.pincode),
        name: data.name,
        ServiceName: service.serviceName,
        SubService: service.subService,
        ProductName: service.productName,
        jobno: jobNumber, // Add sequential job number
        created_at: currentTime // Ensure created_at is set
      };
      
      // Only add email if it exists
      if (data.email) {
        bookingData.email = data.email;
      }
      
      return supabase.from("BookMST").insert(bookingData);
    });
    
    const results = await Promise.all(bookingPromises);
    
    // Check if any insertions failed
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      console.error("Supabase booking errors:", errors.map(e => e.error));
      return { 
        success: false, 
        error: "Failed to create some bookings" 
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating booking entries:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error creating bookings" 
    };
  }
};
