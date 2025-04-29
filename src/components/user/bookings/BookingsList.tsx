
import React, { useState } from "react";
import { Booking } from '@/hooks/useBookings';
import BookingDetailsModal from "./BookingDetailsModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useArtistDetails } from "@/hooks/useArtistDetails";
import MobileBookingView from "./MobileBookingView";
import DesktopBookingView from "./DesktopBookingView";
import EmptyBookingState from "./EmptyBookingState";

interface BookingsListProps {
  filteredBookings: Booking[];
  clearFilters: () => void;
}

const BookingsList = ({ filteredBookings, clearFilters }: BookingsListProps) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Extract artist IDs from bookings
  const artistIds = filteredBookings
    .map(booking => booking.ArtistId)
    .filter((id): id is number => id !== undefined);

  // Get artist details
  const { getArtistName, getArtistPhone } = useArtistDetails(artistIds);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  // If no bookings found after filtering
  if (filteredBookings.length === 0) {
    return <EmptyBookingState clearFilters={clearFilters} />;
  }

  return (
    <div className="space-y-6">
      {isMobile ? (
        <MobileBookingView 
          bookings={filteredBookings}
          getArtistName={getArtistName}
          getArtistPhone={getArtistPhone}
          onViewDetails={handleViewDetails}
        />
      ) : (
        <DesktopBookingView 
          bookings={filteredBookings}
          getArtistName={getArtistName}
          getArtistPhone={getArtistPhone}
          onViewDetails={handleViewDetails}
        />
      )}
      
      <BookingDetailsModal 
        booking={selectedBooking}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
    </div>
  );
};

export default BookingsList;
