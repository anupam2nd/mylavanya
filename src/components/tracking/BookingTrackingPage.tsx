
import React, { useEffect, useState } from "react";
import BookingTrackingHeader from "./BookingTrackingHeader";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import BookingHeader from "./BookingHeader";
import BookingDetails from "./BookingDetails";
import ServicesList from "./ServicesList";
import CustomerDetails from "./CustomerDetails";
import TotalAmount from "./TotalAmount";
import TrackingError from "./TrackingError";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingService {
  id: number;
  Product?: number;
  Purpose: string;
  price?: number;
  Qty?: number;
}

export interface BookingMST {
  Booking_NO: string; // Changed to string type to match the useBookings interface
  name: string;
  email?: string;
  Phone_no: number;
  Address?: string;
  Pincode?: number;
  Booking_date: string;
  booking_time: string;
  Status: string;
  services: BookingService[];
  totalAmount: number;
}

const BookingTrackingPage = () => {
  const { bookingRef } = useParams<{ bookingRef: string }>();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingMST | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingRef) {
        setError("Booking reference is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all bookings with the same booking reference
        const { data, error } = await supabase
          .from("BookMST")
          .select("*")
          .eq("Booking_NO", bookingRef);

        if (error) throw error;

        if (!data || data.length === 0) {
          setError("Booking not found");
          setLoading(false);
          return;
        }

        // Group services under the same booking
        const services = data.map((booking) => ({
          id: booking.id,
          Product: booking.Product,
          Purpose: booking.Purpose,
          price: booking.price,
          Qty: booking.Qty,
        }));

        // Calculate total amount
        const totalAmount = services.reduce(
          (total, service) => total + (service.price || 0) * (service.Qty || 1),
          0
        );

        // Use the first booking's data for common details
        const firstBooking = data[0];
        
        setBooking({
          Booking_NO: String(firstBooking.Booking_NO), // Convert to string explicitly
          name: firstBooking.name || "",
          email: firstBooking.email,
          Phone_no: firstBooking.Phone_no,
          Address: firstBooking.Address,
          Pincode: firstBooking.Pincode,
          Booking_date: firstBooking.Booking_date || "",
          booking_time: firstBooking.booking_time || "",
          Status: firstBooking.Status || "",
          services,
          totalAmount,
        });
      } catch (error) {
        console.error("Error fetching booking:", error);
        setError("Failed to load booking details");
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingRef, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BookingTrackingHeader />
        <div className="bg-white rounded-lg shadow-md p-6 mt-4 space-y-4">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return <TrackingError error={error || "Booking not found"} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BookingTrackingHeader />
      <div className="bg-white rounded-lg shadow-md p-6 mt-4 space-y-6">
        <BookingHeader bookingNo={booking.Booking_NO} status={booking.Status} />
        <BookingDetails date={booking.Booking_date} time={booking.booking_time} />
        <ServicesList services={booking.services} />
        <CustomerDetails
          name={booking.name}
          email={booking.email}
          phone={booking.Phone_no}
          address={booking.Address}
          pincode={booking.Pincode}
        />
        <TotalAmount amount={booking.totalAmount} />
      </div>
    </div>
  );
};

export default BookingTrackingPage;
