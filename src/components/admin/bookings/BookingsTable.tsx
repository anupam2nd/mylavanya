
import React from "react";
import { format } from "date-fns";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Booking {
  id: number;
  Booking_NO: string;
  name: string;
  email: string;
  Phone_no: number;
  Booking_date: string;
  booking_time: string;
  Purpose: string;
  Status: string;
  price: number;
  Address?: string;
  Pincode?: number;
}

interface BookingsTableProps {
  filteredBookings: Booking[];
  handleEditClick: (booking: Booking) => void;
  loading: boolean;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  filteredBookings,
  handleEditClick,
  loading
}) => {
  const isMobile = useIsMobile();

  if (loading) {
    return <div className="flex justify-center p-4">Loading bookings...</div>;
  }

  if (filteredBookings.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No bookings found matching your criteria.
      </p>
    );
  }

  // Mobile view with cards
  if (isMobile) {
    return (
      <div className="space-y-4 px-2">
        {filteredBookings.map((booking) => (
          <div 
            key={booking.id} 
            className="bg-card rounded-lg shadow-sm border p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{booking.Booking_NO}</p>
                <h4 className="font-medium">{booking.name}</h4>
                <p className="text-xs text-muted-foreground">{booking.email}</p>
              </div>
              <StatusBadge status={booking.Status || 'pending'} />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Date</p>
                <p>{booking.Booking_date ? format(new Date(booking.Booking_date), 'MMM dd, yyyy') : 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Time</p>
                <p>{booking.booking_time ? booking.booking_time.substring(0, 5) : 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Service</p>
                <p>{booking.Purpose}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                    View Details
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Booking Details</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-muted-foreground text-xs">Booking #</p>
                        <p className="font-medium">{booking.Booking_NO}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Status</p>
                        <StatusBadge status={booking.Status || 'pending'} />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Customer</p>
                        <p>{booking.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Email</p>
                        <p className="text-sm break-all">{booking.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Phone</p>
                        <p>{booking.Phone_no}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Price</p>
                        <p>₹{booking.price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Service</p>
                        <p>{booking.Purpose}</p>
                      </div>
                      {booking.Address && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground text-xs">Address</p>
                          <p>{booking.Address}</p>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleEditClick(booking)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit Booking
                    </Button>
                  </div>
                </DrawerContent>
              </Drawer>
              
              <Button 
                variant="outline" 
                size="sm"
                className="h-8" 
                onClick={() => handleEditClick(booking)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop view with table
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.Booking_NO}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{booking.name}</span>
                  <span className="text-sm text-muted-foreground">{booking.email}</span>
                </div>
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
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditClick(booking)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingsTable;
