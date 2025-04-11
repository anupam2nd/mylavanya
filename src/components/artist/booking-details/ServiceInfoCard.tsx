
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Calendar, Clock } from "lucide-react";

interface ServiceInfoCardProps {
  booking: Booking;
}

const ServiceInfoCard: React.FC<ServiceInfoCardProps> = ({ booking }) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Service Details</h3>
      <div className="space-y-2">
        <p className="font-medium">{booking.ServiceName} {booking.SubService && `- ${booking.SubService}`}</p>
        {booking.ProductName && (
          <p className="text-sm">{booking.ProductName} x {booking.Qty || 1}</p>
        )}
        <p className="text-sm">Price: ₹{booking.price}</p>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <p className="text-sm">{booking.Booking_date}</p>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <p className="text-sm">{booking.booking_time}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoCard;
