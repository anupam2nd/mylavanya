
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";
import { JobsTable } from "../booking-table/JobsTable";
import { BookingDetailRow } from "../booking-table/BookingDetailRow";

interface AdminBookingsListProps {
  bookingGroups: Record<string, Booking[]>;
  onEditClick: ((booking: Booking) => void) | undefined;
  onDeleteJob: ((booking: Booking) => Promise<void>) | undefined;
  isEditingDisabled: boolean;
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: string) => Promise<void>;
  updateBookingSchedule: (booking: Booking, date: string, time: string) => Promise<void>;
  statusOptions: {status_code: string; status_name: string}[];
  artists: Artist[];
  onViewBooking: ((booking: Booking) => void) | undefined;
  isMember: boolean;
}

export const AdminBookingsView = ({
  bookingGroups,
  onEditClick,
  onDeleteJob,
  isEditingDisabled,
  handleStatusChange,
  handleArtistAssignment,
  updateBookingSchedule,
  statusOptions,
  artists,
  onViewBooking,
  isMember
}: AdminBookingsListProps) => {
  const handleViewBookingClick = (booking: Booking) => {
    if (onViewBooking) {
      onViewBooking(booking);
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(bookingGroups).map(([bookingNo, bookingsGroup]) => (
        <div key={bookingNo} className="border rounded-lg overflow-hidden">
          <BookingDetailRow 
            booking={bookingsGroup[0]} 
            onEdit={isEditingDisabled ? undefined : onEditClick}
            onView={onViewBooking ? handleViewBookingClick : undefined}
          />
          <JobsTable 
            bookingsGroup={bookingsGroup}
            onEditClick={isEditingDisabled ? undefined : onEditClick}
            onDeleteJob={isEditingDisabled ? undefined : onDeleteJob}
            isEditingDisabled={isEditingDisabled}
            handleStatusChange={handleStatusChange}
            handleArtistAssignment={handleArtistAssignment}
            onScheduleChange={updateBookingSchedule}
            statusOptions={statusOptions}
            artists={artists}
            onViewBooking={onViewBooking}
            showActions={!isMember}
          />
        </div>
      ))}
    </div>
  );
};
