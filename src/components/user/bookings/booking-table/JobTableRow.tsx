import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { BookingStatusSelect } from "./BookingStatusSelect";
import { ArtistAssignmentSelect } from "./ArtistAssignmentSelect";
import { JobScheduleCell } from "./JobScheduleCell";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/context/AuthContext";
import { Artist } from "@/hooks/useBookingArtists";

interface JobTableRowProps {
  booking: Booking;
  onEditClick: (booking: Booking) => void;
  onDeleteJob?: (booking: Booking) => Promise<void>;
  isEditingDisabled: boolean;
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: string) => Promise<void>;
  onScheduleChange?: (booking: Booking, date: string, time: string) => Promise<void>;
  statusOptions: {status_code: string; status_name: string}[];
  artists: Artist[];
  showDeleteButton: boolean;
  showActions?: boolean;
  onViewBooking?: (booking: Booking) => void;
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
  showDeleteButton,
  showActions = true,
  onViewBooking,
}: JobTableRowProps) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigningArtist, setIsAssigningArtist] = useState(false);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const { user } = useAuth();
  const isMember = user?.role === 'member';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'controller';
  const isArtist = user?.role === 'artist';

  const isCompleted = booking.Status === 'done' || booking.Status === 'cancelled';
  const isConfirmed = booking.Status === 'confirm';
  const canModifyBooking = !isCompleted && (isConfirmed || user?.role === 'superadmin');

  const handleStatusChangeWrapper = async (newStatus: string) => {
    if (isUpdatingStatus || !canModifyBooking) return;
    
    setIsUpdatingStatus(true);
    try {
      await handleStatusChange(booking, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleArtistAssignmentWrapper = async (artistId: string) => {
    if (isAssigningArtist || !canModifyBooking) return;
    
    setIsAssigningArtist(true);
    try {
      await handleArtistAssignment(booking, artistId);
    } finally {
      setIsAssigningArtist(false);
    }
  };

  const handleScheduleChangeWrapper = async (date: string, time: string) => {
    if (isUpdatingSchedule || !canModifyBooking || !onScheduleChange) return;
    
    setIsUpdatingSchedule(true);
    try {
      await onScheduleChange(booking, date, time);
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  const getArtistName = () => {
    if (!booking.ArtistId) return 'Unassigned';
    const artist = artists.find(a => a.ArtistId === booking.ArtistId);
    return artist ? 
      `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || `Artist #${artist.ArtistId}` 
      : booking.Assignedto || 'Assigned';
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{booking.jobno || 'N/A'}</TableCell>
      <TableCell>
        {booking.ServiceName}{booking.SubService ? ` - ${booking.SubService}` : ''}
        {booking.ProductName && <div className="text-xs text-muted-foreground mt-1">{booking.ProductName} x {booking.Qty || 1}</div>}
      </TableCell>

      <TableCell>
        {isAdmin ? (
          <JobScheduleCell 
            booking={booking}
            isEditingDisabled={isEditingDisabled || !canModifyBooking}
            onScheduleChange={handleScheduleChangeWrapper}
            isUpdating={isUpdatingSchedule}
          />
        ) : (
          <div>
            <div className="flex items-center">
              <span className="text-sm">{booking.Booking_date}</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm">{booking.booking_time}</span>
            </div>
          </div>
        )}
      </TableCell>

      <TableCell>
        <StatusBadge status={booking.Status || 'pending'} />
        
        {isAdmin && (
          <BookingStatusSelect 
            currentStatus={booking.Status || 'pending'} 
            statusOptions={statusOptions} 
            onStatusChange={handleStatusChangeWrapper}
            isDisabled={isEditingDisabled || !canModifyBooking}
          />
        )}
      </TableCell>
      
      <TableCell>
        {getArtistName()}
        
        {isAdmin && (
          <ArtistAssignmentSelect 
            booking={booking}
            artists={artists}
            onArtistAssignment={handleArtistAssignmentWrapper}
            isDisabled={isEditingDisabled || !canModifyBooking}
          />
        )}
      </TableCell>
      
      {showActions && !isAdmin && (
        <TableCell>
          {onViewBooking && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewBooking(booking)}
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          )}
        </TableCell>
      )}
      
      {showActions && isAdmin && (
        <TableCell>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditClick(booking)}
              disabled={isEditingDisabled || !canModifyBooking}
              className="flex items-center"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            {onDeleteJob && showDeleteButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteJob && onDeleteJob(booking)}
                disabled={isEditingDisabled || !canModifyBooking}
                className="flex items-center text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
