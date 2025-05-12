
import React from "react";
import { Calendar, Clock } from "lucide-react";
import { Booking } from "@/hooks/useBookings";

interface MobileBookingViewProps {
  bookings: Booking[];
  getArtistName: (artistId?: number) => string;
  getArtistPhone: (artistId?: number) => string;
  onViewDetails: (booking: Booking) => void;
  isAccordionItem?: boolean;
}

const MobileBookingView = ({
  bookings,
  getArtistName,
  getArtistPhone,
  onViewDetails,
  isAccordionItem = false
}: MobileBookingViewProps) => {
  if (bookings.length === 0) return null;
  
  // For accordion item view, we just show a summary of the main booking
  if (isAccordionItem) {
    const booking = bookings[0];
    
    return (
      <div className="w-full">
        <div className="flex flex-wrap items-start gap-2 sm:gap-0">
          <div className="w-full xs:w-1/3 sm:flex-1 mb-2 xs:mb-0">
            <div className="text-xs text-muted-foreground mb-0.5">Booking No</div>
            <div className="font-medium text-sm">{booking.Booking_NO}</div>
            <div className="text-xs text-muted-foreground mt-1">{booking.Purpose?.substring(0, 20)}{booking.Purpose?.length > 20 ? '...' : ''}</div>
          </div>
          <div className="w-full xs:w-1/3 sm:flex-1 mb-2 xs:mb-0">
            <div className="text-xs text-muted-foreground mb-0.5">Service Time</div>
            <div className="text-xs flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" /> 
              {booking.Booking_date}
            </div>
            <div className="text-xs flex items-center mt-0.5">
              <Clock className="h-3 w-3 mr-1 text-muted-foreground" /> 
              {booking.booking_time}
            </div>
          </div>
          <div className="w-full xs:w-1/3 sm:flex-1">
            <div className="text-xs text-muted-foreground mb-0.5">Total</div>
            <div className="text-sm font-medium">₹{booking.price || 0}</div>
          </div>
        </div>
      </div>
    );
  }

  // Standard view for non-accordion usage
  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.Booking_NO} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow">
          <div className="flex flex-col xs:flex-row justify-between items-start gap-3">
            <div className="w-full xs:flex-1">
              <div className="text-xs text-muted-foreground">Service</div>
              <div className="text-sm font-medium">{booking.Purpose}</div>
              <div className="text-xs text-muted-foreground mt-1">Booking No: {booking.Booking_NO}</div>
            </div>
            <div className="w-full xs:flex-1">
              <div className="text-xs text-muted-foreground mb-1">Service Time</div>
              <div className="flex flex-col space-y-0.5 text-xs">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1 text-muted-foreground" /> {booking.Booking_date}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" /> {booking.booking_time}
                </div>
              </div>
            </div>
            <div className="w-full xs:flex-1 text-left xs:text-right">
              <div className="text-xs text-muted-foreground mb-1">Amount</div>
              <div className="font-medium">₹{booking.price}</div>
            </div>
          </div>
          
          <button 
            className="w-full text-center text-xs text-primary font-medium mt-3 py-1.5 border border-primary/20 rounded-md hover:bg-primary hover:text-white transition-colors"
            onClick={() => onViewDetails(booking)}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};

export default MobileBookingView;
