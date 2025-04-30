
import React from "react";
import { Calendar, Clock, Phone, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Booking } from "@/hooks/useBookings";

interface DesktopBookingViewProps {
  bookings: Booking[];
  getArtistName: (artistId?: number) => string;
  getArtistPhone: (artistId?: number) => string;
  onViewDetails: (booking: Booking) => void;
  isAccordionItem?: boolean;
}

const DesktopBookingView = ({
  bookings,
  getArtistName,
  getArtistPhone,
  onViewDetails,
  isAccordionItem = false
}: DesktopBookingViewProps) => {
  if (isAccordionItem) {
    // For accordion we show a simplified single row
    const booking = bookings[0];
    return (
      <div className="grid grid-cols-5 gap-4 w-full">
        <div className="font-medium">
          <div className="max-w-[250px]">{booking.Purpose}</div>
          {booking.ServiceName && booking.ServiceName !== booking.Purpose && (
            <div className="text-xs text-muted-foreground">{booking.ServiceName}</div>
          )}
        </div>
        <div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{booking.Booking_date}</span>
          </div>
          <div className="flex items-center mt-1">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{booking.booking_time}</span>
          </div>
        </div>
        <div>{booking.Booking_NO}</div>
        <div>
          <StatusBadge status={booking.Status || 'pending'} />
        </div>
        <div className="flex items-center">
          {booking.ArtistId ? (
            <span>{getArtistName(booking.ArtistId)}</span>
          ) : (
            <span className="text-muted-foreground">Not assigned</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Booking #</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Artist</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => {
          // Check if the booking has an artist assigned by either ArtistId or checking the status
          const isArtistAssigned = booking.ArtistId !== undefined && booking.ArtistId !== null;
          const showArtistInfo = isArtistAssigned || 
                                (booking.Status && booking.Status.toUpperCase().includes('BEAUTICIAN') && 
                                 booking.Status.toUpperCase().includes('ASSIGNED'));
          
          return (
            <TableRow key={booking.Booking_NO} className="group hover:bg-muted/50">
              <TableCell className="font-medium">
                <div className="max-w-[250px]">{booking.Purpose}</div>
                {booking.ServiceName && booking.ServiceName !== booking.Purpose && (
                  <div className="text-xs text-muted-foreground">{booking.ServiceName}</div>
                )}
                {booking.SubService && (
                  <div className="text-xs text-muted-foreground">{booking.SubService}</div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{booking.Booking_date}</span>
                </div>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{booking.booking_time}</span>
                </div>
              </TableCell>
              <TableCell>{booking.Booking_NO}</TableCell>
              <TableCell>
                <StatusBadge status={booking.Status || 'pending'} />
              </TableCell>
              <TableCell>
                {showArtistInfo ? (
                  <div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{getArtistName(booking.ArtistId)}</span>
                    </div>
                    {getArtistPhone(booking.ArtistId) && (
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{getArtistPhone(booking.ArtistId)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not assigned</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(booking)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default DesktopBookingView;
