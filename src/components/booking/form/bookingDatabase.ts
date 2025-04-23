
import { BookingFormValues } from "./FormSchema";
import { supabase } from "@/integrations/supabase/client";

// Helper function to log database operations with detailed information
const logDatabaseOperation = (operation: string, details: any) => {
  console.log(`[Database ${operation}]`, JSON.stringify(details, null, 2));
};

// Fetch additional details for each service to be booked
export async function fetchServiceDetails(selectedServices: BookingFormValues["selectedServices"]) {
  logDatabaseOperation("Fetch", { action: "Fetching service details", services: selectedServices });
  
  const serviceDetailsPromises = selectedServices.map(async (service) => {
    // Make sure we have a valid service ID
    const serviceId = typeof service.id === 'number' ? service.id : parseInt(service.id as any, 10);
    
    if (isNaN(serviceId)) {
      console.error("Invalid service ID:", service.id);
      throw new Error(`Invalid service ID: ${service.id}`);
    }
    
    const { data: serviceData, error: serviceError } = await supabase
      .from("PriceMST")
      .select("Services, Subservice, ProductName")
      .eq("prod_id", serviceId)
      .single();

    if (serviceError) {
      console.error("Error fetching service details:", serviceError);
      throw serviceError;
    }

    logDatabaseOperation("Fetch Success", { serviceId, details: serviceData });
    
    return {
      ...service,
      serviceName: serviceData?.Services || "",
      subService: serviceData?.Subservice || "",
      productName: serviceData?.ProductName || ""
    };
  });

  return Promise.all(serviceDetailsPromises);
}

// Creates booking DB records for each service
export async function insertBookings(params: {
  servicesWithDetails: any[],
  bookingRef: string,
  data: BookingFormValues,
  bookingDate: string,
  bookingTime: string,
  phoneNumberNum: number,
  pincodeNum: number | null,
  userEmail: string
}) {
  const {
    servicesWithDetails,
    bookingRef,
    data,
    bookingDate,
    bookingTime,
    phoneNumberNum,
    pincodeNum,
    userEmail
  } = params;

  logDatabaseOperation("Insert", {
    operation: "Starting booking insertion",
    bookingRef,
    userEmail,
    servicesCount: servicesWithDetails.length
  });

  try {
    // Get the table structure first to ensure we're using the correct column names
    const { data: tableInfo, error: tableError } = await supabase
      .from("BookMST")
      .select("*")
      .limit(1);
    
    if (tableError) {
      console.error("Error querying table structure:", tableError);
      throw new Error(`Database error checking table structure: ${tableError.message}`);
    }
    
    // Check if 'email' column actually exists
    const hasEmailColumn = tableInfo && tableInfo[0] && 'email' in tableInfo[0];
    
    if (!hasEmailColumn) {
      console.error("The 'email' column doesn't exist in the BookMST table", tableInfo);
      throw new Error("The BookMST table doesn't have an 'email' column. Please update your database schema.");
    }
    
    logDatabaseOperation("Table Check", { 
      hasEmailColumn,
      tableColumns: tableInfo && tableInfo[0] ? Object.keys(tableInfo[0]) : []
    });

    const bookingPromises = servicesWithDetails.map((service, index) => {
      const jobNumber = index + 1;
      
      // Ensure numeric ID for Product
      const productId = service.id ? Number(service.id) : null;
      
      // Create the booking data object with proper types
      const bookingData = {
        Product: productId,
        Purpose: service.name || "",
        Phone_no: phoneNumberNum,
        Booking_date: bookingDate,
        booking_time: bookingTime,
        Status: "pending",
        price: service.price || 0,
        Booking_NO: bookingRef,
        Qty: service.quantity || 1,
        Address: data.address || "",
        Pincode: pincodeNum,
        name: data.name || "",
        email: userEmail.toLowerCase(), // Ensure lowercase consistency
        ServiceName: service.serviceName || "",
        SubService: service.subService || "",
        ProductName: service.productName || "",
        jobno: jobNumber
      };

      logDatabaseOperation("Booking Entry", { jobNumber, bookingData });
      
      return supabase
        .from("BookMST")
        .insert(bookingData)
        .then(result => {
          if (result.error) {
            console.error(`Error for booking #${jobNumber}:`, result.error);
            return { error: result.error, index: jobNumber };
          }
          console.log(`Success for booking #${jobNumber}`, { status: "success" });
          return { success: true, index: jobNumber };
        });
    });

    const results = await Promise.all(bookingPromises);
    
    // Check for errors
    const errors = results.filter(result => 'error' in result && result.error);
    
    if (errors.length > 0) {
      logDatabaseOperation("Insert Errors", { errors });
      throw new Error(`Failed to create booking(s): ${errors.map(e => (e as any).error?.message || 'Unknown error').join(', ')}`);
    }

    logDatabaseOperation("Insert Success", { 
      bookingRef, 
      successCount: results.length 
    });

    return results;
  } catch (error) {
    logDatabaseOperation("Insert Error", { error });
    throw error;
  }
}
