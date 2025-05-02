
import React, { useState } from "react";
import TrackingForm from "./TrackingForm";
import BookingDetails from "./BookingDetails";
import BookingTrackingHeader from "./BookingTrackingHeader";
import TrackingError from "./TrackingError";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type BookingWithServiceMST = Tables<'BookMST'> & {
  services?: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }[];
};

export const BookingTrackingPage: React.FC = () => {
  const [booking, setBooking] = useState<BookingWithServiceMST | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (
    searchType: "reference" | "phone",
    searchValue: string
  ) => {
    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      let query;
      if (searchType === "reference") {
        // Convert the Booking_NO from string to number for comparison
        const bookingNumber = parseInt(searchValue.trim(), 10);
        if (isNaN(bookingNumber)) {
          setError("Invalid booking reference number");
          setLoading(false);
          return;
        }
        
        query = supabase
          .from("BookMST")
          .select("*")
          .eq("Booking_NO", bookingNumber); // Fixed: Now properly passing a number
      } else {
        // Phone search
        query = supabase
          .from("BookMST")
          .select("*")
          .eq("Phone_no", searchValue.trim()); // Here we might need to convert to number as well, but let's see the result first
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching booking:", fetchError);
        setError("Failed to fetch booking information");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError(
          "No booking found with the provided " +
            (searchType === "reference" ? "reference" : "phone number")
        );
        setLoading(false);
        return;
      }

      // For now, just use the first booking if multiple were found
      const bookingWithServices = {
        ...data[0],
        services: data[0].Product
          ? [
              {
                id: data[0].Product || 0, // Ensure id is always a number
                name: data[0].ProductName || "Unknown Service",
                price: data[0].price || 0,
                quantity: data[0].Qty || 1,
              },
            ]
          : [],
      };

      setBooking(bookingWithServices);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Transform booking data to match the expected format for BookingDetails
  const transformBookingData = (booking: BookingWithServiceMST | null): {
    bookingDetails: Array<{
      Booking_NO: string;
      Purpose: string;
      Phone_no: number;
      Booking_date: string;
      booking_time: string;
      Status: string;
      price: number;
      ProductName: string;
      Qty: number;
      Address?: string;
      Pincode?: number;
      name?: string;
      email?: string;
      id?: number;
      Services?: string;
      Subservice?: string;
      Assignedto?: string;
      AssignedBY?: string;
      ArtistId?: number;
      jobno?: number;
    }>
  } | null => {
    if (!booking) return null;
    
    return {
      bookingDetails: [{
        Booking_NO: booking.Booking_NO ? booking.Booking_NO.toString() : '',
        Purpose: booking.Purpose || '',
        Phone_no: booking.Phone_no || 0,
        Booking_date: booking.Booking_date || '',
        booking_time: booking.booking_time || '',
        Status: booking.Status || '',
        price: booking.price || 0,
        ProductName: booking.ProductName || '',
        Qty: booking.Qty || 1,
        Address: booking.Address,
        Pincode: booking.Pincode,
        name: booking.name,
        email: booking.email,
        id: booking.id,
        Services: booking.ServiceName, // Using ServiceName as Services
        Subservice: booking.SubService,
        Assignedto: booking.Assignedto,
        AssignedBY: booking.AssignedBY,
        ArtistId: booking.ArtistId,
        jobno: booking.jobno
      }]
    };
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <BookingTrackingHeader />
      
      {!booking && (
        <TrackingForm onSearch={handleSearch} loading={loading} />
      )}
      
      {error && <TrackingError message={error} />}
      
      {booking && transformBookingData(booking) && (
        <BookingDetails bookingDetails={transformBookingData(booking)!.bookingDetails} />
      )}
    </div>
  );
};
