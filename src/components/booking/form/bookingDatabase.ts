
import { BookingFormValues } from "./FormSchema";
import { supabase } from "@/integrations/supabase/client";

// Fetch additional details for each service to be booked
export async function fetchServiceDetails(selectedServices: BookingFormValues["selectedServices"]) {
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
      email: userEmail,
      ServiceName: service.serviceName,
      SubService: service.subService,
      ProductName: service.productName,
      jobno: jobNumber
    };

    return supabase.from("BookMST").insert(bookingData);
  });

  const results = await Promise.all(bookingPromises);

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
}
