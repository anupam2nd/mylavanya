
import React from "react";
import { format } from "date-fns";
import { Edit, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Booking } from "@/hooks/useBookings";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

interface DesktopBookingsTableProps {
  bookings: Booking[];
  handleEditClick: (booking: Booking) => void;
  isDeactivateMode: boolean;
}

export const DesktopBookingsTable: React.FC<DesktopBookingsTableProps> = ({ 
  bookings, 
  handleEditClick, 
  isDeactivateMode 
}) => {
  const { user } = useAuth();
  const canEdit = user && ['user', 'admin', 'superadmin'].includes(user.role);

  const handleDeactivate = (booking: Booking) => {
    // For now, this is just a placeholder. The actual deactivation logic
    // will be implemented when we connect this to the API
    console.log("Deactivate booking:", booking.id);
    // In a real implementation, we would set the status to 'inactive' or similar
  };

  const handleDelete = (booking: Booking) => {
    // For superadmin only - placeholder for delete functionality
    console.log("Delete booking:", booking.id);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Booking #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.Booking_NO}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{booking.name}</span>
                  <span className="text-xs text-muted-foreground">{booking.email}</span>
                </div>
              </TableCell>
              <TableCell>{booking.Purpose}</TableCell>
              <TableCell>
                {booking.Booking_date ? format(new Date(booking.Booking_date), 'MMM dd, yyyy') : '—'}
              </TableCell>
              <TableCell>
                {booking.booking_time ? booking.booking_time.substring(0, 5) : '—'}
              </TableCell>
              <TableCell className="text-right">₹{booking.price}</TableCell>
              <TableCell>
                <StatusBadge status={booking.Status || 'pending'} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(booking)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  )}
                  
                  {isDeactivateMode ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeactivate(booking)}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(booking)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
