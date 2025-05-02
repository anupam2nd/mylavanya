
import React, { useEffect, useState } from "react";
import BookingTrackingHeader from "./BookingTrackingHeader";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import BookingHeader from "./BookingHeader";
import BookingDetails, { BookingData } from "./BookingDetails";
import ServicesList from "./ServicesList";
import CustomerDetails from "./CustomerDetails";
import TotalAmount from "./TotalAmount";
import TrackingError from "./TrackingError";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import TrackingForm from "./TrackingForm";

interface BookingService {
  id: number;
  Product?: number;
  Purpose: string;
  price?: number;
  Qty?: number;
  ProductName?: string;
}

export interface BookingMST {
  Booking_NO: string;
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
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingMST | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingDetails = async (bookingReference: string, phoneNumber?: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!bookingReference) {
        setError("Booking reference is required");
        setLoading(false);
        return;
      }

      // Fetch all bookings with the same booking reference
      let query = supabase
        .from("BookMST")
        .select("*")
        .eq("Booking_NO", bookingReference.toString());

      // Add phone number filter if provided
      if (phoneNumber) {
        query = query.eq("Phone_no", phoneNumber);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        setError("Booking not found");
        setLoading(false);
        return;
      }

      // Group services under the same booking
      const services = data.map((booking) => ({
        id: booking.id || 0, // Ensure id is always present
        Product: booking.Product,
        Purpose: booking.Purpose || "",
        price: booking.price,
        Qty: booking.Qty,
        ProductName: booking.ProductName || ""
      }));

      // Calculate total amount
      const totalAmount = services.reduce(
        (total, service) => total + (service.price || 0) * (service.Qty || 1),
        0
      );

      // Use the first booking's data for common details
      const firstBooking = data[0];
      
      setBooking({
        Booking_NO: String(firstBooking.Booking_NO),
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

      // If successful, update URL with booking reference for sharing
      if (!bookingRef) {
        navigate(`/track-booking/${bookingReference}`, { replace: true });
      }
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

  // If bookingRef is provided in URL, fetch details automatically
  useEffect(() => {
    if (bookingRef) {
      fetchBookingDetails(bookingRef);
    }
  }, [bookingRef]);

  const handleTrackingSubmit = async (data: { bookingRef: string; phone: string }) => {
    await fetchBookingDetails(data.bookingRef, data.phone);
  };

  if (bookingRef && loading) {
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

  // If there's no booking reference in the URL or booking data, show the tracking form
  if (!bookingRef && !booking) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BookingTrackingHeader />
        <div className="bg-white rounded-lg shadow-md p-6 mt-4">
          <TrackingForm onSubmit={handleTrackingSubmit} isLoading={loading} />
          {error && <TrackingError error={error} />}
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return <TrackingError error={error || "Booking not found"} />;
  }

  // Create a BookingData object from our booking
  const bookingData: BookingData = {
    Booking_NO: booking.Booking_NO,
    Purpose: booking.services[0]?.Purpose,
    Phone_no: booking.Phone_no,
    Booking_date: booking.Booking_date,
    booking_time: booking.booking_time,
    Status: booking.Status,
    name: booking.name,
    email: booking.email,
    Address: booking.Address,
    Pincode: booking.Pincode
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BookingTrackingHeader />
      <div className="bg-white rounded-lg shadow-md p-6 mt-4 space-y-6">
        <BookingHeader bookingNo={booking.Booking_NO} status={booking.Status} />
        <BookingDetails date={booking.Booking_date} time={booking.booking_time} bookingDetails={[bookingData]} />
        <ServicesList services={booking.services as any} />
        <CustomerDetails booking={bookingData} />
        <TotalAmount amount={booking.totalAmount} />
      </div>
    </div>
  );
};

export default BookingTrackingPage;
