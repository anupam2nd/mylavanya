
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Booking } from "@/hooks/useBookings";

interface BookingHeaderProps {
  booking: Booking;
  onBack: () => void;
}

const BookingHeader: React.FC<BookingHeaderProps> = ({ booking, onBack }) => {
  return (
    <>
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bookings
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <CardTitle>Booking #{booking.Booking_NO}</CardTitle>
        <StatusBadge status={booking.Status || 'pending'} />
      </div>
      <p className="text-sm text-muted-foreground">Job #{booking.jobno || 'N/A'}</p>
    </>
  );
};

export default BookingHeader;
