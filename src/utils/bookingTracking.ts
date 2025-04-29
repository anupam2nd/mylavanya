
import { BookingData } from "@/components/tracking/BookingDetails";

export interface BookingDetails {
  bookingId: string;
  status: string;
  service: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
}

// Transform booking details into the format expected by BookingDetails component
export const transformBookingDetails = (details: BookingDetails | null): BookingData[] => {
  if (!details) return [];
  
  // Create a BookingData array with a single entry that matches the expected interface
  return [{
    Booking_NO: details.bookingId || "",
    Purpose: details.service || "",
    Phone_no: parseInt(details.customerPhone) || 0,
    Booking_date: details.date || "",
    booking_time: details.time || "",
    Status: details.status || "",
    price: 0, // Default value as it's required
    ProductName: details.service || "",
    Qty: 1, // Default quantity
    name: details.customerName || ""
  }];
};
