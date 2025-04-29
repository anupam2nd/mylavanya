
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import TrackingForm, { TrackingFormValues } from "@/components/tracking/TrackingForm";
import BookingDetails, { BookingData } from "@/components/tracking/BookingDetails";
import TrackingError from "@/components/tracking/TrackingError";
import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/hooks/useBookings";
import BookingTrackingHeader from "./BookingTrackingHeader";

export function BookingTrackingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { hasBookings, checkUserHasBookings } = useBookings();
  const navigate = useNavigate();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your booking.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Check if user has bookings
  useEffect(() => {
    const checkUserBookings = async () => {
      if (!isAuthenticated || !user?.email) return;
      
      try {
        const hasAnyBookings = await checkUserHasBookings();
        
        // If user has no bookings, show a message and redirect
        if (!hasAnyBookings) {
          toast({
            title: "No Bookings Found",
            description: "You haven't made any bookings yet.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking bookings:", error);
      }
    };
    
    checkUserBookings();
  }, [isAuthenticated, user, navigate, checkUserHasBookings]);

  // If not authenticated or loading booking check, don't render the page content
  if (!isAuthenticated || hasBookings === null) {
    return null;
  }
  
  // If user has no bookings, we'll already be redirected by the effect
  if (hasBookings === false) {
    return null;
  }

  const handleSubmit = async (data: TrackingFormValues) => {
    setIsLoading(true);
    setError(null);
    setBookingDetails([]);
    
    try {
      // Convert phone to number for comparison with the database
      const phoneNumber = parseInt(data.phone.replace(/\D/g, ''));
      
      // Get all bookings matching the reference and phone number
      const { data: bookingsData, error: bookingError } = await supabase
        .from("BookMST")
        .select("*, ArtistId, jobno") // Ensure we select the jobno field
        .eq("Booking_NO", parseInt(data.bookingRef)) // Convert to number for database query
        .eq("Phone_no", phoneNumber);

      if (bookingError) {
        throw bookingError;
      }

      if (!bookingsData || bookingsData.length === 0) {
        setError("No booking found with the provided details. Please check and try again.");
        return;
      }

      console.log("Raw booking data:", bookingsData);

      // Transform data to ensure Booking_NO is a string
      const detailedBookings: BookingData[] = bookingsData.map(booking => {
        return {
          ...booking,
          Booking_NO: String(booking.Booking_NO), // Ensure Booking_NO is a string
          Services: booking.ServiceName || "General Service",
          Subservice: booking.SubService || "Standard",
          ProductName: booking.ProductName || "Unknown Service",
          ArtistId: booking.ArtistId, // Ensure ArtistId is included
          jobno: booking.jobno // Ensure jobno is included
        };
      });

      console.log("Detailed bookings:", detailedBookings);
      setBookingDetails(detailedBookings);

    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError("Failed to retrieve booking information. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to retrieve booking information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <BookingTrackingHeader />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Booking Tracker</CardTitle>
            <CardDescription>
              Please enter the details below to track your booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrackingForm onSubmit={handleSubmit} isLoading={isLoading} />
            <TrackingError error={error} />
            {bookingDetails.length > 0 && <BookingDetails bookingDetails={bookingDetails} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
