
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingStatusSelect } from "./BookingStatusSelect";
import { ArtistAssignmentSelect } from "./ArtistAssignmentSelect";
import { JobScheduleCell } from "./JobScheduleCell";

interface JobTableRowProps {
  booking: Booking;
  onEditClick: (booking: Booking) => void;
  onDeleteJob?: (booking: Booking) => Promise<void>;
  isEditingDisabled: boolean;
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: number) => Promise<void>;
  onScheduleChange?: (booking: Booking, date: string, time: string) => Promise<void>;
  statusOptions: {status_code: string; status_name: string}[];
  artists: {ArtistId: number; ArtistFirstName: string; ArtistLastName: string}[];
  showDeleteButton: boolean;
}

export const JobTableRow = ({
  booking,
  onEditClick,
  onDeleteJob,
  isEditingDisabled,
  handleStatusChange,
  handleArtistAssignment,
  onScheduleChange,
  statusOptions,
  artists,
  showDeleteButton
}: JobTableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        {booking.jobno ? 
          `JOB-${booking.jobno.toString().padStart(3, '0')}` : 
          'N/A'
        }
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">
            {[booking.ServiceName, booking.SubService].filter(Boolean).join(' > ') || 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            {booking.ProductName ? `${booking.ProductName} (Qty: ${booking.Qty || 1})` : 'N/A'}
          </div>
        </div>
      </TableCell>
      <JobScheduleCell 
        booking={booking} 
        onScheduleChange={onScheduleChange}
        isEditingDisabled={isEditingDisabled}
      />
      <TableCell>
        <div>
          <StatusBadge status={booking.Status || 'pending'} />
          {!isEditingDisabled && (
            <div className="mt-2">
              <BookingStatusSelect
                booking={booking}
                statusOptions={statusOptions}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div>{booking.Assignedto || 'Not assigned'}</div>
        {!isEditingDisabled && (
          <div className="mt-2">
            <ArtistAssignmentSelect
              booking={booking}
              artists={artists}
              onArtistAssign={handleArtistAssignment}
            />
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEditClick(booking)}
            className="h-8"
            disabled={isEditingDisabled}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          
          {!isEditingDisabled && onDeleteJob && showDeleteButton && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDeleteJob(booking)}
              className="h-8"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
