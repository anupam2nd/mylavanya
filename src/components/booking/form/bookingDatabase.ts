
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

// Get next available ID for the booking table to avoid duplicate key errors
async function getNextAvailableId() {
  try {
    const { data, error } = await supabase
      .from("BookMST")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error getting max ID:", error);
      throw new Error("Failed to get next available ID");
    }
    
    // If there's data, use the highest ID + 1, otherwise start with 100000
    const nextId = data && data.length > 0 && data[0].id ? Number(data[0].id) + 1 : 100000;
    console.log("Next available ID:", nextId);
    return nextId;
  } catch (error) {
    console.error("Error in getNextAvailableId:", error);
    // Return a fallback ID that's likely to be unique
    const fallbackId = Math.floor(Math.random() * 1000000) + 1000000;
    console.log("Using fallback ID:", fallbackId);
    return fallbackId;
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
    
    // Get the next available ID to avoid duplicate key errors
    const nextAvailableId = await getNextAvailableId();
    
    const bookingPromises = servicesWithDetails.map(async (service, index) => {
      const jobNumber = index + 1;
      
      // Ensure numeric ID for Product
      const productId = service.id ? Number(service.id) : null;
      
      // Calculate the ID for this booking entry to avoid duplicates
      const bookingEntryId = nextAvailableId + index;
      console.log(`Using ID ${bookingEntryId} for booking job #${jobNumber}`);
      
      // Create the booking data object with proper types and explicit ID
      // Important: We ensure Booking_NO is sent as a string to match the interface
      const bookingData = {
        id: bookingEntryId, // Explicitly set the ID to avoid conflicts
        Product: productId,
        Purpose: service.name || "",
        Phone_no: phoneNumberNum,
        Booking_date: bookingDate,
        booking_time: bookingTime,
        Status: "pending",
        price: service.price || 0,
        Booking_NO: bookingRef.toString(), // Ensure this is a string
        Qty: service.quantity || 1,
        Address: data.address || "",
        Pincode: pincodeNum,
        name: data.name || "",
        // We'll conditionally add the email field based on the database structure
        ...(hasEmailColumn ? { email: userEmail.toLowerCase() } : {}),
        ServiceName: service.serviceName || "",
        SubService: service.subService || "",
        ProductName: service.productName || "",
        jobno: jobNumber
      };

      logDatabaseOperation("Booking Entry", { jobNumber, bookingData });
      
      // Log the exact data being sent to the database
      console.log(`Inserting booking #${jobNumber} with data:`, bookingData);
      
      // Insert the booking data objects
      const { error } = await supabase
        .from("BookMST")
        .insert([bookingData]);
      
      if (error) {
        console.error(`Error for booking #${jobNumber}:`, error);
        return { error: error, index: jobNumber };
      }
      console.log(`Success for booking #${jobNumber}`, { status: "success" });
      return { success: true, index: jobNumber };
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
