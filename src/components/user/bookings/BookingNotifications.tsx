
import { useEffect, useState } from "react";
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
  
  // Don't render anything if there are no pending bookings
  if (pendingBookings === 0) {
    return null;
  }
  
  return null; // We don't render the alert anymore
};

