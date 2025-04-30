
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
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-sm">{booking.Purpose}</div>
            <div className="text-xs text-muted-foreground flex items-center mt-0.5">
              <Calendar className="h-3 w-3 mr-1" /> 
              {booking.Booking_date}
            </div>
            <div className="text-xs text-muted-foreground flex items-center mt-0.5">
              <Clock className="h-3 w-3 mr-1" /> 
              {booking.booking_time}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Booking #</div>
            <div className="text-sm font-medium">{booking.Booking_NO}</div>
          </div>
        </div>
      </div>
    );
  }

  // Standard view for non-accordion usage
  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.Booking_NO} className="p-4 border rounded-lg bg-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium">{booking.Purpose}</div>
              <div className="flex flex-wrap gap-x-4 mt-1.5 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> {booking.Booking_date}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> {booking.booking_time}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Booking #</div>
              <div className="text-sm font-medium">{booking.Booking_NO}</div>
            </div>
          </div>
          
          <button 
            className="w-full text-center text-xs text-primary font-medium mt-3 py-1.5 border border-primary/20 rounded-md hover:bg-primary/5"
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
