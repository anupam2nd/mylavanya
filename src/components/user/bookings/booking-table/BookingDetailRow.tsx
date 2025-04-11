
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, Mail, Home, Edit, Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface BookingDetailRowProps {
  booking: Booking;
  onEdit?: (booking: Booking) => void;
  onView?: (booking: Booking) => void;
}

export const BookingDetailRow: React.FC<BookingDetailRowProps> = ({ booking, onEdit, onView }) => {
  return (
    <div className="bg-muted/40 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 md:mb-0">
          <div>
            <h4 className="font-semibold text-sm flex items-center">
              <span className="mr-2">Booking #{booking.Booking_NO}</span>
              <StatusBadge status={booking.Status || 'pending'} />
            </h4>
            <p className="text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 inline mr-1" />
              {booking.Booking_date}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium">{booking.name}</p>
            <p className="text-xs text-muted-foreground flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {booking.Phone_no}
            </p>
            <p className="text-xs text-muted-foreground flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              {booking.email}
            </p>
          </div>
          
          {booking.Address && (
            <div>
              <p className="text-xs text-muted-foreground flex items-start">
                <Home className="h-3 w-3 mr-1 mt-0.5" />
                <span>{booking.Address} {booking.Pincode && `- ${booking.Pincode}`}</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(booking)}
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          )}
          
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(booking)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
