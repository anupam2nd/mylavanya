
import React, { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Booking } from "@/hooks/useBookings";
import { useArtistDetails } from "@/hooks/useArtistDetails";
import BookingDetailsModal from "./BookingDetailsModal";
import MobileBookingView from "./MobileBookingView";
import DesktopBookingView from "./DesktopBookingView";

interface BookingsListProps {
  filteredBookings: Booking[];
  clearFilters: () => void;
}

const BookingsList = ({ filteredBookings, clearFilters }: BookingsListProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Extract all artist IDs to fetch their details
  const artistIds = filteredBookings
    .map(booking => booking.ArtistId)
    .filter(id => id !== undefined);
    
  console.log("Artist IDs extracted:", artistIds);
    
  // Use the hook to get artist details
  const { getArtistName, getArtistPhone } = useArtistDetails(artistIds);
  
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };
  
  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  return (
    <>
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
      
      {selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          open={!!selectedBooking} 
          onOpenChange={handleCloseModal}
          getArtistName={getArtistName}
          getArtistPhone={getArtistPhone}
        />
      )}
    </>
  );
};

export default BookingsList;
