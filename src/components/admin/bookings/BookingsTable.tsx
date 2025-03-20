
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Booking } from "@/hooks/useBookings";
import { MobileBookingCard } from "./MobileBookingCard";
import { DesktopBookingsTable } from "./DesktopBookingsTable";

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
          <MobileBookingCard
            key={booking.id}
            booking={booking}
            handleEditClick={handleEditClick}
          />
        ))}
      </div>
    );
  }

  // Desktop view with table
  return (
    <DesktopBookingsTable 
      bookings={filteredBookings} 
      handleEditClick={handleEditClick} 
    />
  );
};

export default BookingsTable;
