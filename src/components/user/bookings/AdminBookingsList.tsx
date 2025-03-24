
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Edit } from "lucide-react";
import { Booking } from "@/hooks/useBookings";

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  onEditClick: (booking: Booking) => void;
}

const BookingsList = ({ bookings, loading, onEditClick }: BookingsListProps) => {
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Booking No.</th>
              <th className="text-left py-3 px-4 font-medium">Customer</th>
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Time</th>
              <th className="text-left py-3 px-4 font-medium">Purpose</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">{booking.Booking_NO}</td>
                <td className="py-3 px-4">{booking.name || 'N/A'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                    {booking.Booking_date}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                    {booking.booking_time}
                  </div>
                </td>
                <td className="py-3 px-4">{booking.Purpose}</td>
                <td className="py-3 px-4">
                  <div className={`px-3 py-1 text-xs font-medium rounded-full inline-block
                    ${booking.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.Status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.Status === 'beautician_assigned' ? 'bg-purple-100 text-purple-800' :
                          booking.Status === 'done' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'}`}>
                    {booking.Status?.toUpperCase() || 'PENDING'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditClick(booking)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsList;
