
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";
import BookingsList from "./BookingsList";

interface AdminBookingsListProps {
  bookings: Booking[];
  loading: boolean;
  onEditClick: (booking: Booking) => void;
  onAddNewJob?: (booking: Booking) => void;
  statusOptions: {status_code: string; status_name: string}[];
  artists: Artist[];
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: string) => Promise<void>;
  isEditingDisabled: boolean;
  onDeleteJob?: (booking: Booking) => Promise<void>;
  onScheduleChange?: (booking: Booking, date: string, time: string) => Promise<void>;
  onViewBooking?: (booking: Booking) => void;
}

const AdminBookingsList: React.FC<AdminBookingsListProps> = ({
  bookings,
  loading,
  onEditClick,
  onAddNewJob,
  statusOptions,
  artists,
  handleStatusChange,
  handleArtistAssignment,
  isEditingDisabled,
  onDeleteJob,
  onScheduleChange,
  onViewBooking,
}) => {
  return (
    <BookingsList
      customBookings={bookings}
      customLoading={loading}
      userRole="admin"
      onEditClick={onEditClick}
      onAddNewJob={onAddNewJob}
      statusOptions={statusOptions}
      artists={artists}
      handleStatusChange={handleStatusChange}
      handleArtistAssignment={handleArtistAssignment}
      isEditingDisabled={isEditingDisabled}
      onDeleteJob={onDeleteJob}
      onScheduleChange={onScheduleChange}
      onViewBooking={onViewBooking}
    />
  );
};

export default AdminBookingsList;
