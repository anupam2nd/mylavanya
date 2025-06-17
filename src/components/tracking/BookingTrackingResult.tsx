
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/hooks/useBookings";

interface BookingTrackingResultProps {
  bookings: Booking[];
}

const BookingTrackingResult = ({ bookings }: BookingTrackingResultProps) => {
  if (bookings.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold">Booking Results</h2>
      {bookings.map((booking) => (
        <Card key={booking.id} className="w-full">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Booking #{booking.Booking_NO}</span>
              <Badge variant={booking.Status === 'Confirmed' ? 'default' : 'secondary'}>
                {booking.Status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{booking.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{booking.Phone_no}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium">{booking.ServiceName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{booking.Booking_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{booking.booking_time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-medium">₹{booking.price}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingTrackingResult;
