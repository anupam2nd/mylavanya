
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
  const [scheduleData, setScheduleData] = useState<{ date: Date | undefined; time: string }>({
    date: undefined,
    time: "09:00"
  });
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [currentArtistId, setCurrentArtistId] = useState<string>("");

  useEffect(() => {
    // Initialize schedule and status data for the booking
    if (booking) {
      setScheduleData({
        date: booking.Booking_date ? new Date(booking.Booking_date) : undefined,
        time: booking.booking_time ? booking.booking_time.substring(0, 5) : "09:00",
      });
      
      setCurrentStatus(booking.Status || 'pending');
      setCurrentArtistId(booking.ArtistId?.toString() || "");
    }
  }, [booking]);

  const handleStatusChangeWrapper = async (newStatus: string) => {
    if (!booking || isUpdating["status"]) return;
    
    setIsUpdating((prev) => ({ ...prev, status: true }));
    try {
      await onStatusChange(booking, newStatus);
      setCurrentStatus(newStatus);
      
      // Update status for all related bookings with same booking number
      if (booking.Booking_NO) {
        await Promise.all(
          relatedBookings.map(async (service) => {
            if (service.id !== booking.id) {
              await onStatusChange(service, newStatus);
            }
          })
        );
      }
    } finally {
      setIsUpdating((prev) => ({ ...prev, status: false }));
    }
  };

  const handleArtistAssignmentWrapper = async (artistId: string) => {
    if (!booking || isUpdating["artist"]) return;
    
    setIsUpdating((prev) => ({ ...prev, artist: true }));
    try {
      await onArtistAssignment(booking, artistId);
      setCurrentArtistId(artistId);
      
      // Update artist for all related bookings with same booking number
      if (booking.Booking_NO) {
        await Promise.all(
          relatedBookings.map(async (service) => {
            if (service.id !== booking.id) {
              await onArtistAssignment(service, artistId);
            }
          })
        );
      }
    } finally {
      setIsUpdating((prev) => ({ ...prev, artist: false }));
    }
  };

  const handleScheduleChangeWrapper = async () => {
    if (!booking || isUpdating["schedule"] || !scheduleData.date) return;
    
    setIsUpdating((prev) => ({ ...prev, schedule: true }));
    try {
      const formattedDate = format(scheduleData.date, "yyyy-MM-dd");
      await onScheduleChange(booking, formattedDate, scheduleData.time);
      
      // Update schedule for all related bookings with same booking number
      if (booking.Booking_NO) {
        await Promise.all(
          relatedBookings.map(async (service) => {
            if (service.id !== booking.id) {
              await onScheduleChange(service, formattedDate, scheduleData.time);
            }
          })
        );
      }
    } finally {
      setIsUpdating((prev) => ({ ...prev, schedule: false }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setScheduleData((prev) => ({ ...prev, date }));
  };

  const handleTimeChange = (time: string) => {
    setScheduleData((prev) => ({ ...prev, time }));
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
              <h3 className="text-lg font-semibold mb-2">Booking Management</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Status</p>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={currentStatus} />
                    <Select
                      value={currentStatus}
                      onValueChange={handleStatusChangeWrapper}
                      disabled={isUpdating["status"]}
                    >
                      <SelectTrigger className="w-full">
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
                    {isUpdating["status"] && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Assigned Artist</p>
                  <div className="flex items-center space-x-2">
                    <span>
                      {currentArtistId
                        ? artists.find((a) => a.ArtistId.toString() === currentArtistId)
                          ? `${artists.find((a) => a.ArtistId.toString() === currentArtistId)?.ArtistFirstName || ''} ${
                              artists.find((a) => a.ArtistId.toString() === currentArtistId)?.ArtistLastName || ''
                            }`.trim()
                          : booking.Assignedto || "Assigned"
                        : "Unassigned"}
                    </span>
                    <Select
                      value={currentArtistId || "unassigned"}
                      onValueChange={handleArtistAssignmentWrapper}
                      disabled={isUpdating["artist"]}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Assign artist" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {artists.map((artist) => (
                          <SelectItem key={artist.ArtistId} value={artist.ArtistId?.toString() || ""}>
                            {`${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() ||
                              `Artist #${artist.ArtistId}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isUpdating["artist"] && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Schedule</p>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleData.date
                            ? format(scheduleData.date, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduleData.date}
                          onSelect={handleDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={scheduleData.time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="flex-1"
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleScheduleChangeWrapper}
                      disabled={isUpdating["schedule"] || !scheduleData.date}
                    >
                      {isUpdating["schedule"] ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : null}
                      Update Schedule
                    </Button>
                  </div>
                </div>
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
                    <div className="flex flex-col">
                      <span>{service.Booking_date}</span>
                      <span className="text-sm text-muted-foreground">{service.booking_time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={service.Status || 'pending'} />
                  </TableCell>
                  <TableCell>
                    {service.ArtistId
                      ? artists.find((a) => a.ArtistId.toString() === service.ArtistId?.toString())
                        ? `${artists.find((a) => a.ArtistId.toString() === service.ArtistId?.toString())?.ArtistFirstName || ''} ${
                            artists.find((a) => a.ArtistId.toString() === service.ArtistId?.toString())?.ArtistLastName || ''
                          }`.trim()
                        : service.Assignedto || "Assigned"
                      : "Unassigned"}
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
