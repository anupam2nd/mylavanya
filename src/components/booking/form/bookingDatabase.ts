
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

// Check if the BookMST table has an email column and get the exact column name (checking case)
export async function checkBookingTableStructure() {
  try {
    console.log("Checking BookMST table structure...");
    
    // Get exact column names with their original case
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'BookMST' });
    
    if (error) {
      console.error("Error checking table structure using RPC:", error);
      
      // Fallback: try to get a row to examine column names
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("BookMST")
        .select("*")
        .limit(1);
      
      if (fallbackError) {
        console.error("Error in fallback check:", fallbackError);
        return { hasEmailColumn: false, error: fallbackError.message, exactEmailColumn: null };
      }
      
      // Log the table structure to help diagnose the issue
      const columnNames = fallbackData && fallbackData[0] ? Object.keys(fallbackData[0]) : [];
      console.log("BookMST table columns (fallback):", columnNames);
      
      // Find any column that could be 'email' regardless of case
      const emailColumnName = columnNames.find(col => col.toLowerCase() === 'email');
      const hasEmailColumn = !!emailColumnName;
      console.log(`BookMST has email column (fallback): ${hasEmailColumn}, exact name: ${emailColumnName}`);
      
      return { hasEmailColumn, columnNames, exactEmailColumn: emailColumnName };
    }
    
    // Process RPC result
    console.log("Table structure data:", data);
    
    // If data is an array of column info objects
    let columnNames: string[] = [];
    let exactEmailColumn: string | null = null;
    
    if (Array.isArray(data)) {
      columnNames = data.map((col: any) => col.column_name || col.name);
      exactEmailColumn = columnNames.find(col => col.toLowerCase() === 'email') || null;
    } else {
      console.warn("Unexpected RPC result format:", data);
    }
    
    // Check if any column matches 'email' case-insensitively
    const hasEmailColumn = !!exactEmailColumn;
    console.log(`BookMST has email column: ${hasEmailColumn}, exact name: ${exactEmailColumn}`);
    
    return { hasEmailColumn, columnNames, exactEmailColumn };
  } catch (error) {
    console.error("Error checking table structure:", error);
    return { hasEmailColumn: false, error: String(error), exactEmailColumn: null };
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
    
    // If there's data, use the highest ID + 1, otherwise start with 5
    const nextId = data && data.length > 0 && data[0].id ? Number(data[0].id) + 1 : 5;
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
    // First, check if the email column exists in BookMST and get its exact name
    const { hasEmailColumn, exactEmailColumn } = await checkBookingTableStructure();
    
    if (!hasEmailColumn) {
      console.error("The 'email' column doesn't exist in the BookMST table");
      throw new Error("The database schema doesn't match what's expected. The 'email' column is missing.");
    }
    
    console.log(`Using email column: "${exactEmailColumn}" for database operations`);
    
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
      // Important: For database interaction, convert Booking_NO to a number
      const bookingData: any = {
        id: bookingEntryId, // Explicitly set the ID to avoid conflicts
        Product: productId,
        Purpose: service.name || "",
        Phone_no: phoneNumberNum,
        Booking_date: bookingDate,
        booking_time: bookingTime,
        Status: "pending",
        price: service.price || 0,
        Booking_NO: parseInt(bookingRef), // Convert string to number for DB
        Qty: service.quantity || 1,
        Address: data.address || "",
        Pincode: pincodeNum,
        name: data.name || "",
        // We'll conditionally add the email field using the exact column name
        ServiceName: service.serviceName || "",
        SubService: service.subService || "",
        ProductName: service.productName || "",
        jobno: jobNumber
      };

      // Use the exact email column name from the database
      if (exactEmailColumn) {
        bookingData[exactEmailColumn] = userEmail.toLowerCase();
      }

      logDatabaseOperation("Booking Entry", { jobNumber, bookingData });
      
      // Log the exact data being sent to the database
      console.log(`Inserting booking #${jobNumber} with data:`, bookingData);
      
      // Insert the booking data objects
      const { data: insertedData, error } = await supabase
        .from("BookMST")
        .insert([bookingData])
        .select();
      
      if (error) {
        console.error(`Error for booking #${jobNumber}:`, error);
        return { error: error, index: jobNumber, details: error.details || error.message };
      }
      console.log(`Success for booking #${jobNumber}`, { status: "success", data: insertedData });
      return { success: true, index: jobNumber };
    });

    const results = await Promise.all(bookingPromises);
    
    // Check for errors
    const errors = results.filter(result => 'error' in result && result.error);
    
    if (errors.length > 0) {
      logDatabaseOperation("Insert Errors", { errors });
      throw new Error(`Failed to create booking(s): ${errors.map(e => (e as any).error?.message || (e as any).details || 'Unknown error').join(', ')}`);
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
