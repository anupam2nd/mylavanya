
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
}

const MobileBookingView = ({
  bookings,
  getArtistName,
  getArtistPhone,
  onViewDetails
}: MobileBookingViewProps) => {
  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.Booking_NO} className="hover:shadow-md transition-shadow">
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
            {booking.ArtistId && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Artist:</p>
                <p className="text-sm flex items-center">
                  <User className="h-3 w-3 mr-1" /> {getArtistName(booking.ArtistId)}
                </p>
                {getArtistPhone(booking.ArtistId) && (
                  <p className="text-xs flex items-center text-muted-foreground">
                    <Phone className="h-3 w-3 mr-1" /> {getArtistPhone(booking.ArtistId)}
                  </p>
                )}
              </div>
            )}
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
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MobileBookingView;
