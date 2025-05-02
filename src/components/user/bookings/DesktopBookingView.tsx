
import React from "react";
import { Calendar, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  // For accordion item view we just need a simple overview
  if (isAccordionItem) {
    const booking = bookings[0];
    return (
      <div className="grid grid-cols-3 gap-4 w-full text-sm">
        <div className="text-left">
          <div className="text-xs text-muted-foreground mb-1">Booking No</div>
          <div className="font-medium">
            {booking.Booking_NO}
            <div className="text-xs text-muted-foreground mt-0.5">
              {booking.Purpose?.substring(0, 20)}{booking.Purpose?.length > 20 ? '...' : ''}
            </div>
          </div>
        </div>
        <div className="text-left">
          <div className="text-xs text-muted-foreground mb-1">Service Time</div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{booking.Booking_date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{booking.booking_time}</span>
            </div>
          </div>
        </div>
        <div className="text-left">
          <div className="text-xs text-muted-foreground mb-1">Total</div>
          <div className="font-medium">{booking.price ? `₹${booking.price}` : '₹0'}</div>
        </div>
      </div>
    );
  }

  // Standard table view for regular bookings display
  return (
    <Table className="text-sm">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px] font-medium">Service</TableHead>
          <TableHead className="font-medium">Service Time</TableHead>
          <TableHead className="font-medium">Booking No</TableHead>
          <TableHead className="text-right font-medium">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.Booking_NO} className="group hover:bg-muted/50">
            <TableCell className="font-medium">
              <div>{booking.Purpose}</div>
              {booking.ServiceName && booking.ServiceName !== booking.Purpose && (
                <div className="text-xs text-muted-foreground mt-0.5">{booking.ServiceName}</div>
              )}
              {booking.SubService && (
                <div className="text-xs text-muted-foreground mt-0.5">{booking.SubService}</div>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span>{booking.Booking_date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span>{booking.booking_time}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>{booking.Booking_NO}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onViewDetails(booking)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DesktopBookingView;
