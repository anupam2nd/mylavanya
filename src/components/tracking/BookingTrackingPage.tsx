
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
          .eq("Booking_NO", bookingNumber);
      } else {
        // Phone search
        query = supabase
          .from("BookMST")
          .select("*")
          .eq("Phone_no", searchValue.trim());
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

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <BookingTrackingHeader />
      
      {!booking && (
        <TrackingForm onSearch={handleSearch} loading={loading} />
      )}
      
      {error && <TrackingError message={error} />}
      
      {booking && <BookingDetails booking={booking} />}
    </div>
  );
};
