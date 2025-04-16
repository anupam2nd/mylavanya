import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";
import { StatusBadge } from "@/components/ui/status-badge";

interface AdminBookingsListProps {
  bookings: Booking[];
  loading: boolean;
  onEditClick: (booking: Booking) => void;
  onAddNewJob?: (booking: Booking) => void;
  statusOptions: { status_code: string; status_name: string }[];
  artists: Artist[];
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: string) => Promise<void>;
  isEditingDisabled?: boolean;
  onDeleteJob?: (booking: Booking) => Promise<void>;
  onScheduleChange?: (booking: Booking, date: string, time: string) => Promise<void>;
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
  isEditingDisabled = false,
  onDeleteJob,
  onScheduleChange
}) => {
  const [changingStatus, setChangingStatus] = useState<Record<string, boolean>>({});
  const [assigningArtist, setAssigningArtist] = useState<Record<string, boolean>>({});
  const [schedulingBooking, setSchedulingBooking] = useState<Record<string, { isOpen: boolean, date: Date | undefined, time: string }>>({});

  // Group bookings by Booking_NO
  const bookingGroups: Record<string, Booking[]> = {};
  bookings.forEach(booking => {
    const key = booking.Booking_NO || '';
    if (!bookingGroups[key]) {
      bookingGroups[key] = [];
    }
    bookingGroups[key].push(booking);
  });

  // Sort bookings by date, newest first
  const sortedBookingNumbers = Object.keys(bookingGroups).sort((a, b) => {
    const dateA = new Date(bookingGroups[a][0].Booking_date).getTime();
    const dateB = new Date(bookingGroups[b][0].Booking_date).getTime();
    return dateB - dateA;
  });

  const handleStatusChangeWrapper = async (booking: Booking, newStatus: string) => {
    try {
      setChangingStatus(prev => ({ ...prev, [booking.id]: true }));
      await handleStatusChange(booking, newStatus);
    } finally {
      setChangingStatus(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  const handleArtistAssignmentWrapper = async (booking: Booking, artistId: string) => {
    try {
      setAssigningArtist(prev => ({ ...prev, [booking.id]: true }));
      await handleArtistAssignment(booking, artistId);
    } finally {
      setAssigningArtist(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  const handleSchedulePopoverChange = (open: boolean, bookingId: string) => {
    if (!schedulingBooking[bookingId]) {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        setSchedulingBooking(prev => ({
          ...prev,
          [bookingId]: {
            isOpen: open,
            date: booking.Booking_date ? new Date(booking.Booking_date) : undefined,
            time: booking.booking_time ? booking.booking_time.substring(0, 5) : "09:00"
          }
        }));
      }
    } else {
      setSchedulingBooking(prev => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          isOpen: open
        }
      }));
    }
  };

  const handleDateChange = (date: Date | undefined, bookingId: string) => {
    setSchedulingBooking(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        date
      }
    }));
  };

  const handleTimeChange = (time: string, bookingId: string) => {
    setSchedulingBooking(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        time
      }
    }));
  };

  const saveScheduleChange = async (booking: Booking) => {
    if (!schedulingBooking[booking.id]?.date || !onScheduleChange) return;
    
    const newDate = format(schedulingBooking[booking.id].date, 'yyyy-MM-dd');
    const newTime = schedulingBooking[booking.id].time;
    
    try {
      setSchedulingBooking(prev => ({
        ...prev,
        [booking.id]: {
          ...prev[booking.id],
          isOpen: false
        }
      }));
      
      await onScheduleChange(booking, newDate, newTime);
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No bookings found.</p>
      </div>
    );
  }

  return (
    <ScrollArea>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job #</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBookingNumbers.map(bookingNo => {
            const bookingGroup = bookingGroups[bookingNo];
            if (!bookingGroup || bookingGroup.length === 0) return null;

            // Use the first booking in the group for shared details
            const firstBooking = bookingGroup[0];

            return bookingGroup.map(booking => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.jobno || 'N/A'}</TableCell>
                <TableCell>
                  {booking.ServiceName}{booking.SubService ? ` - ${booking.SubService}` : ''}
                  {booking.ProductName && <div className="text-xs text-muted-foreground mt-1">{booking.ProductName} x {booking.Qty || 1}</div>}
                </TableCell>
                <TableCell>
                  <Popover open={schedulingBooking[booking.id]?.isOpen} onOpenChange={(open) => handleSchedulePopoverChange(open, booking.id)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-[180px] justify-start font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {schedulingBooking[booking.id]?.date ? (
                          format(schedulingBooking[booking.id].date as Date, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                        {schedulingBooking[booking.id]?.time && (
                          <span className="ml-2">{schedulingBooking[booking.id].time}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="center">
                      <div className="grid gap-2">
                        <Calendar
                          mode="single"
                          selected={schedulingBooking[booking.id]?.date}
                          onSelect={(date) => handleDateChange(date, booking.id)}
                          className="border rounded-md"
                        />
                        <Input
                          type="time"
                          value={schedulingBooking[booking.id]?.time || "09:00"}
                          onChange={(e) => handleTimeChange(e.target.value, booking.id)}
                        />
                        <Button size="sm" onClick={() => saveScheduleChange(booking)}>
                          Save Schedule
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <StatusBadge status={booking.Status || 'pending'} />
                    <Select
                      value={booking.Status || 'pending'}
                      onValueChange={async (value) => {
                        if (changingStatus[booking.id]) return;
                        await handleStatusChangeWrapper(booking, value);
                      }}
                      disabled={isEditingDisabled}
                    >
                      <SelectTrigger className="ml-2 w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.status_code} value={option.status_code}>
                            {option.status_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {changingStatus[booking.id] && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {booking.Assignedto || 'Unassigned'}
                    <Select
                      value={booking.ArtistId || ""}
                      onValueChange={async (value) => {
                        if (assigningArtist[booking.id]) return;
                        await handleArtistAssignmentWrapper(booking, value);
                      }}
                      disabled={isEditingDisabled}
                    >
                      <SelectTrigger className="ml-2 w-[150px]">
                        <SelectValue placeholder="Assign artist" />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist.ArtistId} value={artist.ArtistId}>
                            {artist.ArtistFirstName} {artist.ArtistLastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {assigningArtist[booking.id] && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditClick(booking)} disabled={isEditingDisabled}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {onAddNewJob && (
                        <DropdownMenuItem onClick={() => onAddNewJob(firstBooking)}>
                          <Plus className="mr-2 h-4 w-4" /> Add New Job
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onDeleteJob && (
                        <DropdownMenuItem onClick={() => onDeleteJob(booking)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default AdminBookingsList;
