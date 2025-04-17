import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";
import { StatusBadge } from "@/components/ui/status-badge";

interface BookingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  relatedBookings: Booking[];
  onStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  onArtistAssignment: (booking: Booking, artistId: string) => Promise<void>;
  onScheduleChange: (booking: Booking, date: string, time: string) => Promise<void>;
  statusOptions: { status_code: string; status_name: string }[];
  artists: Artist[];
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  isOpen,
  onClose,
  booking,
  relatedBookings,
  onStatusChange,
  onArtistAssignment,
  onScheduleChange,
  statusOptions,
  artists,
}) => {
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [scheduleData, setScheduleData] = useState<Record<string, { date: Date | undefined; time: string }>>({});

  useEffect(() => {
    // Initialize schedule data for each booking
    const initialScheduleData: Record<string, { date: Date | undefined; time: string }> = {};
    relatedBookings.forEach((booking) => {
      initialScheduleData[booking.id] = {
        date: booking.Booking_date ? new Date(booking.Booking_date) : undefined,
        time: booking.booking_time ? booking.booking_time.substring(0, 5) : "09:00",
      };
    });
    setScheduleData(initialScheduleData);
  }, [relatedBookings]);

  const handleStatusChangeWrapper = async (booking: Booking, newStatus: string) => {
    setIsUpdating((prev) => ({ ...prev, [`status-${booking.id}`]: true }));
    try {
      await onStatusChange(booking, newStatus);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [`status-${booking.id}`]: false }));
    }
  };

  const handleArtistAssignmentWrapper = async (booking: Booking, artistId: string) => {
    setIsUpdating((prev) => ({ ...prev, [`artist-${booking.id}`]: true }));
    try {
      await onArtistAssignment(booking, artistId);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [`artist-${booking.id}`]: false }));
    }
  };

  const handleScheduleChangeWrapper = async (booking: Booking) => {
    const bookingData = scheduleData[booking.id];
    if (!bookingData?.date) return;

    setIsUpdating((prev) => ({ ...prev, [`schedule-${booking.id}`]: true }));
    try {
      const formattedDate = format(bookingData.date, "yyyy-MM-dd");
      await onScheduleChange(booking, formattedDate, bookingData.time);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [`schedule-${booking.id}`]: false }));
    }
  };

  const handleDateChange = (date: Date | undefined, bookingId: string) => {
    setScheduleData((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], date },
    }));
  };

  const handleTimeChange = (time: string, bookingId: string) => {
    setScheduleData((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], time },
    }));
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Details #{booking.Booking_NO}</DialogTitle>
          <DialogDescription>
            Manage services, schedules, and assignments for this booking
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {booking.name}</p>
                <p><span className="font-medium">Email:</span> {booking.email}</p>
                <p><span className="font-medium">Phone:</span> {booking.Phone_no}</p>
                <p><span className="font-medium">Address:</span> {booking.Address}</p>
                {booking.Pincode && <p><span className="font-medium">Pincode:</span> {booking.Pincode}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Booking Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Booking No:</span> {booking.Booking_NO}</p>
                <p><span className="font-medium">Date:</span> {booking.Booking_date}</p>
                <p><span className="font-medium">Time:</span> {booking.booking_time}</p>
                <p><span className="font-medium">Services Count:</span> {relatedBookings.length}</p>
                <p><span className="font-medium">Status:</span> <StatusBadge status={booking.Status || 'pending'} /></p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="my-4">
          <h3 className="text-lg font-semibold mb-2">Services</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedBookings.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.ServiceName}</TableCell>
                  <TableCell>
                    {service.ProductName} {service.Qty && service.Qty > 1 && `x ${service.Qty}`}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduleData[service.id]?.date
                              ? format(scheduleData[service.id].date as Date, "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={scheduleData[service.id]?.date}
                            onSelect={(date) => handleDateChange(date, service.id)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={scheduleData[service.id]?.time || "09:00"}
                          onChange={(e) => handleTimeChange(e.target.value, service.id)}
                          className="w-24"
                        />
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleScheduleChangeWrapper(service)}
                        disabled={isUpdating[`schedule-${service.id}`]}
                      >
                        {isUpdating[`schedule-${service.id}`] ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : null}
                        Save Schedule
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-2">
                      <StatusBadge status={service.Status || 'pending'} />
                      <Select
                        value={service.Status || "pending"}
                        onValueChange={(value) => handleStatusChangeWrapper(service, value)}
                        disabled={isUpdating[`status-${service.id}`]}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.status_code} value={option.status_code}>
                              {option.status_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isUpdating[`status-${service.id}`] && (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-2">
                      <span>
                        {service.ArtistId
                          ? artists.find((a) => a.ArtistId === service.ArtistId)
                            ? `${artists.find((a) => a.ArtistId === service.ArtistId)?.ArtistFirstName || ''} ${
                                artists.find((a) => a.ArtistId === service.ArtistId)?.ArtistLastName || ''
                              }`.trim()
                            : service.Assignedto || "Assigned"
                          : "Unassigned"}
                      </span>
                      <Select
                        value={service.ArtistId || "unassigned"}
                        onValueChange={(value) => handleArtistAssignmentWrapper(service, value)}
                        disabled={isUpdating[`artist-${service.id}`]}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Assign artist" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {artists.map((artist) => (
                            <SelectItem key={artist.ArtistId} value={artist.ArtistId || `artist_${artist.ArtistId}`}>
                              {`${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() ||
                                `Artist #${artist.ArtistId}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isUpdating[`artist-${service.id}`] && (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleScheduleChangeWrapper(service)}>
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
