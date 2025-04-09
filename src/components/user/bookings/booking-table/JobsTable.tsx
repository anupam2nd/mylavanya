
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Booking } from "@/hooks/useBookings";
import { JobTableRow } from "./JobTableRow";
import { useAuth } from "@/context/AuthContext";

interface JobsTableProps {
  bookingsGroup: Booking[];
  onEditClick: (booking: Booking) => void;
  onDeleteJob?: (booking: Booking) => Promise<void>;
  isEditingDisabled: boolean;
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: number) => Promise<void>;
  onScheduleChange?: (booking: Booking, date: string, time: string) => Promise<void>;
  statusOptions: {status_code: string; status_name: string}[];
  artists: {ArtistId: number; ArtistFirstName: string; ArtistLastName: string}[];
}

export const JobsTable = ({
  bookingsGroup,
  onEditClick,
  onDeleteJob,
  isEditingDisabled,
  handleStatusChange,
  handleArtistAssignment,
  onScheduleChange,
  statusOptions,
  artists
}: JobsTableProps) => {
  const { user } = useAuth();
  const isMember = user?.role === 'member';
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job No.</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned To</TableHead>
          {!isMember && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookingsGroup.map((booking) => (
          <JobTableRow
            key={`${booking.id}-${booking.jobno}`}
            booking={booking}
            onEditClick={onEditClick}
            onDeleteJob={onDeleteJob}
            isEditingDisabled={isEditingDisabled}
            handleStatusChange={handleStatusChange}
            handleArtistAssignment={handleArtistAssignment}
            onScheduleChange={onScheduleChange}
            statusOptions={statusOptions}
            artists={artists}
            showDeleteButton={bookingsGroup.length > 1}
          />
        ))}
      </TableBody>
    </Table>
  );
};
