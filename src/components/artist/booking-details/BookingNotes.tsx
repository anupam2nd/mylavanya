
import React from "react";
import { Booking } from "@/hooks/useBookings";

interface BookingNotesProps {
  booking: Booking;
}

const BookingNotes: React.FC<BookingNotesProps> = ({ booking }) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="text-sm font-medium mb-2">Notes</h3>
      <p className="text-sm text-muted-foreground">{booking.Purpose || 'No additional notes'}</p>
    </div>
  );
};

export default BookingNotes;
