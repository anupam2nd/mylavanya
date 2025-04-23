
import { BookingFormValues } from "./FormSchema";
import { supabase } from "@/integrations/supabase/client";

// Fetch additional details for each service to be booked
export async function fetchServiceDetails(selectedServices: BookingFormValues["selectedServices"]) {
  console.log("Fetching service details for:", selectedServices);
  const serviceDetailsPromises = selectedServices.map(async (service) => {
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

  console.log("Inserting bookings with params:", {
    servicesWithDetails,
    bookingRef,
    bookingDate,
    bookingTime,
    phoneNumberNum,
    pincodeNum,
    userEmail,
    address: data.address,
    name: data.name
  });

  // Log the structure of the first row we'll insert
  if (servicesWithDetails.length > 0) {
    const firstBooking = {
      Product: Number(servicesWithDetails[0].id) || null,
      Purpose: servicesWithDetails[0].name,
      Phone_no: phoneNumberNum,
      Booking_date: bookingDate,
      booking_time: bookingTime,
      Status: "pending",
      price: servicesWithDetails[0].price,
      Booking_NO: bookingRef,
      Qty: servicesWithDetails[0].quantity || 1,
      Address: data.address,
      Pincode: pincodeNum,
      name: data.name,
      email: userEmail,
      ServiceName: servicesWithDetails[0].serviceName,
      SubService: servicesWithDetails[0].subService,
      ProductName: servicesWithDetails[0].productName,
      jobno: 1
    };
    console.log("First booking record to insert:", firstBooking);
  }

  const bookingPromises = servicesWithDetails.map((service, index) => {
    const jobNumber = index + 1;
    
    // Create the booking data object
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
      email: userEmail, // Make sure this is lowercase to match column name
      ServiceName: service.serviceName,
      SubService: service.subService,
      ProductName: service.productName,
      jobno: jobNumber
    };

    console.log(`Booking #${jobNumber} data:`, bookingData);
    
    return supabase
      .from("BookMST")
      .insert(bookingData)
      .then(result => {
        if (result.error) {
          console.error(`Error for booking #${jobNumber}:`, result.error);
          return { error: result.error, index: jobNumber };
        }
        console.log(`Success for booking #${jobNumber}:`, result);
        return { success: true, index: jobNumber };
      });
  });

  const results = await Promise.all(bookingPromises);

  let hasErrors = false;
  let errorDetails = [];
  
  results.forEach((result, idx) => {
    if ('error' in result && result.error) {
      errorDetails.push({
        index: idx,
        message: result.error.message,
        details: result.error
      });
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.error("Booking errors:", errorDetails);
    throw new Error(`Failed to create booking(s): ${errorDetails.map(e => e.message).join(', ')}`);
  }

  return results;
}
