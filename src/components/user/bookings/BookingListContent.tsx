
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

interface BookingListContentProps {
  bookings: Booking[];
  loading: boolean;
}

const BookingListContent: React.FC<BookingListContentProps> = ({ bookings, loading }) => {
  if (loading) {
    return <div>Loading bookings...</div>;
  }

  if (!bookings || bookings.length === 0) {
    return <div>No bookings found</div>;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{booking.Booking_NO}</h3>
                <p className="text-sm text-gray-600">{booking.Booking_date}</p>
                <p className="text-sm">
                  {booking.name} | {booking.email}
                </p>
              </div>
              <StatusBadge status={booking.Status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingListContent;
