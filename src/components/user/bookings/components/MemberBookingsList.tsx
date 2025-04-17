
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { BookingDetailRow } from "../booking-table/BookingDetailRow";

interface MemberBookingsListProps {
  primaryBookings: any[];
  onViewBooking: ((booking: Booking) => void) | undefined;
}

export const MemberBookingsList = ({ primaryBookings, onViewBooking }: MemberBookingsListProps) => {
  const handleViewBookingClick = (booking: Booking) => {
    if (onViewBooking) {
      onViewBooking(booking);
    }
  };

  return (
    <div className="space-y-6">
      {primaryBookings.map((booking: any) => (
        <div key={booking.Booking_NO} className="border rounded-lg overflow-hidden">
          <BookingDetailRow 
            booking={booking} 
            onView={onViewBooking ? handleViewBookingClick : undefined}
          />
        </div>
      ))}
    </div>
  );
};
