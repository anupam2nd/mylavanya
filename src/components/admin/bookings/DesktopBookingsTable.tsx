
import React from "react";
import { format } from "date-fns";
import { Edit, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Booking } from "@/hooks/useBookings";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface DesktopBookingsTableProps {
  bookings: Booking[];
  handleEditClick: (booking: Booking) => void;
  showEditButton?: boolean; // Add this prop with optional flag
}

export const DesktopBookingsTable: React.FC<DesktopBookingsTableProps> = ({
  bookings,
  handleEditClick,
  showEditButton = true, // Default to true if not provided
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            {showEditButton && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.Booking_NO}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{booking.name}</span>
                  <span className="text-sm text-muted-foreground">{booking.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="flex items-center">
                  <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                  {booking.Phone_no}
                </span>
              </TableCell>
              <TableCell>
                {booking.Booking_date ? format(new Date(booking.Booking_date), 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {booking.booking_time ? booking.booking_time.substring(0, 5) : 'N/A'}
              </TableCell>
              <TableCell>{booking.Purpose}</TableCell>
              <TableCell>
                <StatusBadge status={booking.Status || 'pending'} />
              </TableCell>
              {showEditButton && (
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditClick(booking)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
