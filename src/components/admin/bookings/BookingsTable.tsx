
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Booking } from "@/hooks/useBookings";
import { MobileBookingCard } from "./MobileBookingCard";
import { DesktopBookingsTable } from "./DesktopBookingsTable";
import { useAuth } from "@/context/AuthContext";

interface BookingsTableProps {
  filteredBookings: Booking[];
  handleEditClick: (booking: Booking) => void;
  handleArchive?: (booking: Booking) => void;
  loading: boolean;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  filteredBookings,
  handleEditClick,
  handleArchive,
  loading
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Check user role for access control
  const isDeactivateMode = user?.role !== 'superadmin';

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
            isDeactivateMode={isDeactivateMode}
            onArchive={handleArchive}
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
      isDeactivateMode={isDeactivateMode}
      onArchive={handleArchive}
    />
  );
};

export default BookingsTable;
