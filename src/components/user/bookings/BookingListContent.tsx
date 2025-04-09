
import React from "react";
import AdminBookingsList from "@/components/user/bookings/AdminBookingsList";

interface BookingListContentProps {
  loading: boolean;
  bookings: any[];
  filteredBookings: any[];
  handleEditClick: (booking: any) => void;
  handleAddNewJob: (booking: any) => void;
  statusOptions: any[];
  artists: any[];
  handleStatusChange: (booking: any, status: string) => Promise<void>;
  handleArtistAssignment: (booking: any, artistId: number) => Promise<void>;
  isEditingDisabled: boolean;
  handleDeleteJob: (booking: any) => Promise<void>;
  handleScheduleChange: (booking: any, date: string, time: string) => Promise<void>;
  sortField: string;
  sortDirection: string;
}

export const BookingListContent: React.FC<BookingListContentProps> = ({
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
  sortField,
  sortDirection
}) => {
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
        <p className="text-muted-foreground">No bookings found in the system.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredBookings.length} of {bookings.length} bookings
        {sortField && (
          <span className="ml-2">
            sorted by {sortField === "creation_date" ? "creation date" : "booking date"} ({sortDirection === "desc" ? "newest first" : "oldest first"})
          </span>
        )}
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
    </>
  );
};
