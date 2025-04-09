
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Calendar, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingStatusSelect } from "./BookingStatusSelect";
import { ArtistAssignmentSelect } from "./ArtistAssignmentSelect";
import { DateTimePicker } from "./DateTimePicker";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface BookingDetailRowProps {
  bookingsGroup: Booking[];
  onEditClick: (booking: Booking) => void;
  onAddNewJob?: (booking: Booking) => void;
  isEditingDisabled: boolean;
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: number) => Promise<void>;
  statusOptions: {status_code: string; status_name: string}[];
  artists: {ArtistId: number; ArtistFirstName: string; ArtistLastName: string}[];
  onDeleteJob?: (booking: Booking) => Promise<void>;
  onScheduleChange?: (booking: Booking, date: string, time: string) => Promise<void>;
}

export const BookingDetailRow = ({
  bookingsGroup,
  onEditClick,
  onAddNewJob,
  isEditingDisabled,
  handleStatusChange,
  handleArtistAssignment,
  statusOptions,
  artists,
  onDeleteJob,
  onScheduleChange
}: BookingDetailRowProps) => {
  const mainBooking = bookingsGroup[0];
  const [editingSchedule, setEditingSchedule] = useState<{[key: number]: boolean}>({});
  
  const toggleScheduleEdit = (bookingId: number) => {
    setEditingSchedule(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };
  
  return (
    <TableRow>
      <TableCell colSpan={7} className="p-0 border-t-0">
        <div className="bg-muted/20 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Service Details</h4>
            {onAddNewJob && !isEditingDisabled && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAddNewJob(mainBooking)}
              >
                <Plus className="h-3 w-3 mr-1" /> Add New Job
              </Button>
            )}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job No.</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsGroup.map((booking) => (
                <TableRow key={`${booking.id}-${booking.jobno}`}>
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
                  <TableCell>
                    {editingSchedule[booking.id] && onScheduleChange ? (
                      <DateTimePicker 
                        booking={booking}
                        onSave={(date, time) => {
                          onScheduleChange(booking, date, time);
                          toggleScheduleEdit(booking.id);
                        }}
                        onCancel={() => toggleScheduleEdit(booking.id)}
                      />
                    ) : (
                      <div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">{booking.Booking_date}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">{booking.booking_time}</span>
                        </div>
                        {!isEditingDisabled && onScheduleChange && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-6 p-0 text-xs mt-1" 
                            onClick={() => toggleScheduleEdit(booking.id)}
                          >
                            Change schedule
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
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
                      
                      {!isEditingDisabled && onDeleteJob && bookingsGroup.length > 1 && (
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
              ))}
            </TableBody>
          </Table>
        </div>
      </TableCell>
    </TableRow>
  );
};
