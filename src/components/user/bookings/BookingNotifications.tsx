
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useUserBookings } from "@/hooks/useUserBookings";

export const BookingNotifications = () => {
  const { bookings } = useUserBookings();
  const [pendingBookings, setPendingBookings] = useState<number>(0);
  
  useEffect(() => {
    // Count bookings that need payment
    const pending = bookings.filter(booking => 
      booking.Status === 'pending' || booking.Status === 'awaiting_payment'
    ).length;
    setPendingBookings(pending);
  }, [bookings]);
  
  if (pendingBookings === 0) {
    return null;
  }
  
  return (
    <Alert className="mb-6">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <div>
          <AlertTitle className="text-amber-800">Payment Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            You have {pendingBookings} {pendingBookings === 1 ? 'booking' : 'bookings'} that {pendingBookings === 1 ? 'requires' : 'require'} payment. 
            Please complete payment to confirm your appointments.
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

