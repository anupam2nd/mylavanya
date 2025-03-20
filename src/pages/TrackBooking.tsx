
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import TrackingForm, { TrackingFormValues } from "@/components/tracking/TrackingForm";
import BookingDetails, { BookingData } from "@/components/tracking/BookingDetails";
import TrackingError from "@/components/tracking/TrackingError";

const TrackBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingData[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        .select("*")
        .eq("Booking_NO", data.bookingRef)
        .eq("Phone_no", phoneNumber);

      if (bookingError) {
        throw bookingError;
      }

      if (!bookingsData || bookingsData.length === 0) {
        setError("No booking found with the provided details. Please check and try again.");
        return;
      }

      console.log("Raw booking data:", bookingsData);

      // Get all service details for the bookings
      const servicePromises = bookingsData.map(booking => 
        supabase
          .from("PriceMST")
          .select("ProductName")
          .eq("prod_id", booking.Product)
          .single()
      );

      const serviceResults = await Promise.all(servicePromises);
      
      // Combine booking and service data
      const detailedBookings = bookingsData.map((booking, index) => {
        return {
          ...booking,
          ProductName: serviceResults[index].data?.ProductName || "Unknown Service",
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
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3">Track Your Booking</h1>
            <p className="text-gray-600">
              Enter your booking reference number and phone number to check the status of your booking.
            </p>
          </div>

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
    </MainLayout>
  );
};

export default TrackBooking;
