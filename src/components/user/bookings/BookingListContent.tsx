
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

interface BookingListContentProps {
  bookings: Booking[];
  loading: boolean;
  filteredBookings?: Booking[]; // Add this prop to fix the TypeScript error
}

const BookingListContent: React.FC<BookingListContentProps> = ({ bookings, loading, filteredBookings }) => {
  // Use filtered bookings if provided, otherwise use the regular bookings
  const displayBookings = filteredBookings || bookings;
  
  if (loading) {
    return <div>Loading bookings...</div>;
  }

  if (!displayBookings || displayBookings.length === 0) {
    return <div>No bookings found</div>;
  }

  return (
    <div className="space-y-4">
      {displayBookings.map((booking) => (
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
