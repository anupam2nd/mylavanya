
import { format } from "date-fns";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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
}

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  onEditClick: (booking: Booking) => void;
}

const BookingsList = ({ bookings, loading, onEditClick }: BookingsListProps) => {
  if (loading) {
    return <div className="flex justify-center p-4">Loading your bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <p className="text-muted-foreground">
        You don't have any bookings yet. Book a service to see your appointments here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.Booking_NO}</TableCell>
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
                  onClick={() => onEditClick(booking)}
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

export default BookingsList;
