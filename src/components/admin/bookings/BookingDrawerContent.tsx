
import React from "react";
import { Edit, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Booking } from "@/hooks/useBookings";

interface BookingDrawerContentProps {
  booking: Booking;
  handleEditClick: (booking: Booking) => void;
}

export const BookingDrawerContent: React.FC<BookingDrawerContentProps> = ({
  booking,
  handleEditClick,
}) => {
  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-muted-foreground text-xs">Booking #</p>
          <p className="font-medium">{booking.Booking_NO}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Status</p>
          <StatusBadge status={booking.Status || 'pending'} />
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Customer</p>
          <p>{booking.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Email</p>
          <p className="text-sm break-all">{booking.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Phone</p>
          <p className="flex items-center">
            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
            {booking.Phone_no}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Price</p>
          <p>₹{booking.price}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Service</p>
          <p>{booking.Purpose}</p>
        </div>
        {booking.Address && (
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">Address</p>
            <p>{booking.Address}</p>
          </div>
        )}
      </div>
      <Button 
        className="w-full" 
        onClick={() => handleEditClick(booking)}
      >
        <Edit className="h-4 w-4 mr-2" /> Edit Booking
      </Button>
    </div>
  );
};
