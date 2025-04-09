
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Booking } from "@/hooks/useBookings";
import { BookingTableRow } from "./booking-table/BookingTableRow";
import { BookingDetailRow } from "./booking-table/BookingDetailRow";
import { useBookingArtists } from "@/hooks/useBookingArtists";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  onEditClick: (booking: Booking) => void;
  onAddNewJob?: (booking: Booking) => void;
}

interface GroupedBookings {
  [key: string]: Booking[];
}

const AdminBookingsList = ({ bookings, loading, onEditClick, onAddNewJob }: BookingsListProps) => {
  const [expandedBookings, setExpandedBookings] = useState<string[]>([]);
  const { artists } = useBookingArtists();
  const { 
    statusOptions, 
    fetchStatusOptions, 
    handleStatusChange, 
    handleArtistAssignment 
  } = useBookingStatusManagement();

  useEffect(() => {
    fetchStatusOptions();
  }, []);

  const toggleBooking = (bookingNo: string) => {
    setExpandedBookings(prev => 
      prev.includes(bookingNo) 
        ? prev.filter(id => id !== bookingNo) 
        : [...prev, bookingNo]
    );
  };

  // Handle artist assignment with the loaded artists
  const handleArtistAssignmentWithArtists = (booking: Booking, artistId: number) => {
    return handleArtistAssignment(booking, artistId, artists);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No bookings found.</p>
      </div>
    );
  }

  // Group bookings by Booking_NO
  const groupedBookings: GroupedBookings = bookings.reduce((acc, booking) => {
    const bookingNo = booking.Booking_NO || 'unknown';
    if (!acc[bookingNo]) {
      acc[bookingNo] = [];
    }
    acc[bookingNo].push(booking);
    return acc;
  }, {} as GroupedBookings);

  // Check if the onEditClick is a no-op function (used for artists who shouldn't edit)
  const isEditingDisabled = onEditClick.toString() === (() => {}).toString();

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking No.</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Creation Date</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedBookings).map(([bookingNo, bookingsGroup]) => {
            // Use the first booking in the group for the main row details
            const mainBooking = bookingsGroup[0];
            const isExpanded = expandedBookings.includes(bookingNo);
            
            return (
              <React.Fragment key={bookingNo}>
                <BookingTableRow 
                  booking={mainBooking}
                  isExpanded={isExpanded}
                  toggleBooking={toggleBooking}
                />
                
                {isExpanded && (
                  <BookingDetailRow
                    bookingsGroup={bookingsGroup}
                    onEditClick={onEditClick}
                    onAddNewJob={onAddNewJob}
                    isEditingDisabled={isEditingDisabled}
                    handleStatusChange={handleStatusChange}
                    handleArtistAssignment={handleArtistAssignmentWithArtists}
                    statusOptions={statusOptions}
                    artists={artists}
                  />
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminBookingsList;
