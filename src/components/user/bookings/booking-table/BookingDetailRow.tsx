
import React, { useState } from "react";
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Calendar, Clock, Trash2 } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingStatusSelect } from "./BookingStatusSelect";
import { ArtistAssignmentSelect } from "./ArtistAssignmentSelect";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DateTimePicker } from "./DateTimePicker";

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
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Service Details</h4>
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
                <TableRow key={`${booking.id}-${booking.jobno}`} className="hover:bg-white/50">
                  <TableCell>
                    {booking.jobno ? 
                      `JOB-${booking.jobno.toString().padStart(3, '0')}` : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.ProductName || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">
                        {[
                          booking.ServiceName, 
                          booking.SubService
                        ].filter(Boolean).join(' > ')}
                      </span>
                      <span className="text-xs">
                        Qty: {booking.Qty || 1}
                      </span>
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
                      <div className="flex flex-col">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                          {booking.Booking_date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                          {booking.booking_time}
                        </span>
                        {!isEditingDisabled && onScheduleChange && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-6 p-0 text-xs" 
                            onClick={() => toggleScheduleEdit(booking.id)}
                          >
                            Change schedule
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={booking.Status || 'pending'} />
                      {!isEditingDisabled && (
                        <BookingStatusSelect
                          booking={booking}
                          statusOptions={statusOptions}
                          onStatusChange={handleStatusChange}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div>{booking.Assignedto || 'Not assigned'}</div>
                      {!isEditingDisabled && (
                        <ArtistAssignmentSelect
                          booking={booking}
                          artists={artists}
                          onArtistAssign={handleArtistAssignment}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
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
