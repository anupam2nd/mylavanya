
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, ChevronUp, ChevronDown } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { format } from "date-fns";

interface BookingTableRowProps {
  booking: Booking;
  isExpanded: boolean;
  toggleBooking: (bookingNo: string) => void;
}

export const BookingTableRow = ({ booking, isExpanded, toggleBooking }: BookingTableRowProps) => {
  const bookingNo = booking.Booking_NO || 'unknown';
  
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">{bookingNo}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{booking.name || 'N/A'}</span>
          <span className="text-xs text-muted-foreground">{booking.email || 'N/A'}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="flex items-center">
          <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
          {booking.Phone_no || 'N/A'}
        </span>
      </TableCell>
      <TableCell>
        {booking.created_at ? 
          format(new Date(booking.created_at), 'MMM dd, yyyy') : 
          'N/A'
        }
      </TableCell>
      <TableCell>{booking.Purpose}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
            {booking.Address || 'N/A'}
          </span>
          <span className="text-xs text-muted-foreground">
            {booking.Pincode ? `PIN: ${booking.Pincode}` : ''}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => toggleBooking(bookingNo)}
          className="h-8 p-0 w-8"
        >
          {isExpanded ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
          <span className="sr-only">
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
        </Button>
      </TableCell>
    </TableRow>
  );
};
