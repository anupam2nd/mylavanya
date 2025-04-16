import React from "react";
import AdminBookingsList from "./AdminBookingsList";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";

interface BookingListContentProps {
  loading: boolean;
  bookings: Booking[];
  filteredBookings: Booking[];
  handleEditClick: (booking: Booking) => void;
  handleAddNewJob?: (booking: Booking) => void;
  statusOptions: {status_code: string; status_name: string}[];
  artists: Artist[];
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: string) => Promise<void>;
  isEditingDisabled: boolean;
  handleDeleteJob?: (booking: Booking) => Promise<void>;
  handleScheduleChange?: (booking: Booking, date: string, time: string) => Promise<void>;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export function BookingListContent({ 
  loading,
  bookings,
  filteredBookings,
  handleEditClick, 
  handleAddNewJob,
  statusOptions,
  artists,
  handleStatusChange,
  handleArtistAssignment,
  isEditingDisabled,
  handleDeleteJob,
  handleScheduleChange,
  sortField = "created_at",
  sortDirection = "desc"
}) {
  const displayText = filteredBookings.length < bookings.length
    ? `Showing ${filteredBookings.length} of ${bookings.length} bookings`
    : `Showing ${bookings.length} bookings`;

  const sortText = sortField === "created_at" 
    ? "creation date"
    : "booking date";

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {displayText}
        <span className="ml-2">
          sorted by {sortText} ({sortDirection === "desc" ? "newest first" : "oldest first"})
        </span>
      </div>
      
      <AdminBookingsList
        bookings={filteredBookings}
        loading={loading}
        onEditClick={handleEditClick}
        onAddNewJob={handleAddNewJob}
        statusOptions={statusOptions}
        artists={artists}
        handleStatusChange={handleStatusChange}
        handleArtistAssignment={handleArtistAssignment}
        isEditingDisabled={isEditingDisabled}
        onDeleteJob={handleDeleteJob}
        onScheduleChange={handleScheduleChange}
      />
    </div>
  );
}
