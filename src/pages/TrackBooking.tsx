
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
  const [bookingDetails, setBookingDetails] = useState<BookingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TrackingFormValues) => {
    setIsLoading(true);
    setError(null);
    setBookingDetails(null);
    
    try {
      // Convert phone to number for comparison with the database
      const phoneNumber = parseInt(data.phone.replace(/\D/g, ''));
      
      // First get the booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from("BookMST")
        .select("*")
        .eq("Booking_NO", data.bookingRef)
        .eq("Phone_no", phoneNumber)
        .maybeSingle();

      if (bookingError) {
        throw bookingError;
      }

      if (!bookingData) {
        setError("No booking found with the provided details. Please check and try again.");
        return;
      }

      // Get the service details
      const { data: serviceData, error: serviceError } = await supabase
        .from("PriceMST")
        .select("ProductName")
        .eq("prod_id", bookingData.Product)
        .maybeSingle();

      if (serviceError) {
        throw serviceError;
      }

      // Combine booking and service data
      setBookingDetails({
        ...bookingData,
        ProductName: serviceData?.ProductName || "Unknown Service",
      });

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
              <BookingDetails bookingDetails={bookingDetails} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrackBooking;
