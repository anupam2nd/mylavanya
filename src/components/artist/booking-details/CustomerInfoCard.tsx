
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Info, Phone, MapPin } from "lucide-react";

interface CustomerInfoCardProps {
  booking: Booking;
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ booking }) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Customer Details</h3>
      <div className="space-y-2">
        <div className="flex items-start">
          <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">{booking.name}</p>
            <p className="text-sm text-muted-foreground">{booking.email}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          <p>{booking.Phone_no}</p>
        </div>
        {booking.Address && (
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
            <p className="text-sm">{booking.Address} {booking.Pincode && `- ${booking.Pincode}`}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInfoCard;
