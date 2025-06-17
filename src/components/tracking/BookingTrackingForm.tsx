
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BookingDetails from "./BookingDetails";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TrackingFormTabs } from "./TrackingFormTabs";
import { PhoneFormValues } from "./PhoneTrackingForm";
import { ReferenceFormValues } from "./ReferenceTrackingForm";
import { transformBookingDetails, BookingDetails as BookingDetailsType } from "@/utils/bookingTracking";

export function BookingTrackingForm() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetailsType | null>(null);
  const [hasBookings, setHasBookings] = useState<boolean | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user has bookings
  useEffect(() => {
    const checkUserBookings = async () => {
      if (!user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from("BookMST")
          .select("id")
          .eq("email", user.email)
          .limit(1);
          
        if (!error) {
          setHasBookings(data && data.length > 0);
          
          // If user has no bookings, show a message and redirect
          if (data && data.length === 0) {
            toast({
              title: "No Bookings Found",
              description: "You haven't made any bookings yet.",
              variant: "destructive",
            });
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error checking bookings:", error);
      }
    };
    
    if (user) {
      checkUserBookings();
    }
  }, [user, navigate]);

  function onPhoneSubmit(values: PhoneFormValues) {
    // In a real implementation, you would fetch booking data based on the phone number
    console.log(values);
    setBookingDetails({
      bookingId: "123456",
      status: "In progress",
      service: "Premium Facial",
      date: "2023-04-15",
      time: "14:30",
      customerName: "Jane Doe",
      customerPhone: values.phoneNumber,
    });
  }

  function onReferenceSubmit(values: ReferenceFormValues) {
    // In a real implementation, you would fetch booking data based on the reference
    console.log(values);
    setBookingDetails({
      bookingId: values.bookingRef,
      status: "Confirmed",
      service: "Deep Cleansing Facial",
      date: "2023-04-20",
      time: "10:15",
      customerName: "John Smith",
      customerPhone: "9876543210",
    });
  }

  // If we're still checking if the user has bookings, don't render yet
  if (hasBookings === null && user) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Track Your Booking</h2>
        <p className="text-muted-foreground">
          Enter your phone number or booking reference to track your appointment
          status.
        </p>
      </div>

      {user && user.role === 'member' && (
        <div className="flex justify-center mb-4">
          <Button asChild className="w-full">
            <Link to="/user/bookings">
              View All My Bookings
            </Link>
          </Button>
        </div>
      )}

      <TrackingFormTabs 
        onPhoneSubmit={onPhoneSubmit}
        onReferenceSubmit={onReferenceSubmit}
      />

      {bookingDetails && <BookingDetails bookingDetails={transformBookingDetails(bookingDetails)} />}
    </div>
  );
}
