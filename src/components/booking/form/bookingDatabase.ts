
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

// Check if the BookMST table has an email column
export async function checkBookingTableStructure() {
  try {
    const { data, error } = await supabase
      .from("BookMST")
      .select("*")
      .limit(1);
    
    if (error) {
      console.error("Error checking table structure:", error);
      return { hasEmailColumn: false, error: error.message };
    }
    
    // Log the table structure to help diagnose the issue
    const columnNames = data && data[0] ? Object.keys(data[0]) : [];
    console.log("BookMST table columns:", columnNames);
    
    const hasEmailColumn = columnNames.includes('email');
    console.log(`BookMST has email column: ${hasEmailColumn}`);
    
    return { hasEmailColumn, columnNames };
  } catch (error) {
    console.error("Error checking table structure:", error);
    return { hasEmailColumn: false, error: String(error) };
  }
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
    // First, check if the email column exists in BookMST
    const { hasEmailColumn, columnNames } = await checkBookingTableStructure();
    
    if (!hasEmailColumn) {
      console.error("The 'email' column doesn't exist in the BookMST table", columnNames);
      throw new Error("The database schema doesn't match what's expected. The 'email' column is missing.");
    }
    
    const bookingPromises = servicesWithDetails.map((service, index) => {
      const jobNumber = index + 1;
      
      // Ensure numeric ID for Product
      const productId = service.id ? Number(service.id) : null;
      
      // Create the booking data object with proper types
      // Ensure we're using the correct column names based on the database schema
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
        // We'll conditionally add the email field based on the database structure
        // This should prevent the "column does not exist" error
        ...(hasEmailColumn ? { email: userEmail.toLowerCase() } : {}),
        ServiceName: service.serviceName || "",
        SubService: service.subService || "",
        ProductName: service.productName || "",
        jobno: jobNumber
      };

      logDatabaseOperation("Booking Entry", { jobNumber, bookingData });
      
      // Log the exact data being sent to the database
      console.log(`Inserting booking #${jobNumber} with data:`, bookingData);
      
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
