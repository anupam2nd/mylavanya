
import { useMemo } from "react";
import { Booking } from "@/hooks/useBookings";

export const useAdminBookingGroups = (bookings: Booking[]) => {
  const bookingGroups = useMemo(() => {
    // Group bookings by booking number
    const groups: Record<string, Booking[]> = {};
    
    bookings.forEach(booking => {
      const bookingNo = booking.Booking_NO || 'unknown';
      if (!groups[bookingNo]) {
        groups[bookingNo] = [];
      }
      groups[bookingNo].push(booking);
    });
    
    return groups;
  }, [bookings]);

  // Get primary bookings (first booking from each group)
  const primaryBookings = useMemo(() => {
    return Object.entries(bookingGroups).map(([bookingNo, bookings]) => ({
      ...bookings[0],
      serviceCount: bookings.length
    }));
  }, [bookingGroups]);

  return {
    bookingGroups,
    primaryBookings
  };
};
