
import React from "react";
import { Calendar, Clock, Phone, User } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        // Check if the booking has an artist assigned by either ArtistId or checking the status
        const isArtistAssigned = booking.ArtistId !== undefined && booking.ArtistId !== null;
        const hasBeauticianStatus = booking.Status && 
                                    (booking.Status.toUpperCase().includes('BEAUTICIAN') || 
                                     booking.Status.toUpperCase().includes('ASSIGNED'));
        
        const showArtistInfo = isArtistAssigned || hasBeauticianStatus;
        const artistName = getArtistName(booking.ArtistId);
        const artistPhone = getArtistPhone(booking.ArtistId);
        
        return (
          <Card key={booking.Booking_NO} className={`hover:shadow-md transition-shadow ${isAccordionItem ? 'shadow-none border-0' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{booking.Purpose}</CardTitle>
              <div className="mt-2">
                <StatusBadge status={booking.Status || 'pending'} />
              </div>
            </CardHeader>
            <div className="p-4 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Date:</p>
                  <p className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {booking.Booking_date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time:</p>
                  <p className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {booking.booking_time}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Booking #:</p>
                <p className="text-sm font-medium">{booking.Booking_NO}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Artist:</p>
                {showArtistInfo ? (
                  <>
                    <p className="text-sm flex items-center">
                      <User className="h-3 w-3 mr-1" /> {artistName !== 'Not assigned' ? artistName : 'Not assigned'}
                    </p>
                    {artistPhone && (
                      <p className="text-xs flex items-center text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" /> {artistPhone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm">Not assigned</p>
                )}
              </div>
              {!isAccordionItem && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => onViewDetails(booking)}
                  >
                    View Details
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MobileBookingView;
