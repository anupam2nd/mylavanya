
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";

interface BookingManagementProps {
  booking: Booking;
  currentStatus: string;
  currentArtistId: string;
  scheduleData: { date: Date | undefined; time: string };
  isUpdating: Record<string, boolean>;
  statusOptions: { status_code: string; status_name: string }[];
  artists: Artist[];
  onStatusChange: (newStatus: string) => void;
  onArtistChange: (artistId: string) => void;
  onScheduleChange: () => void;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

export const BookingManagement = ({
  booking,
  currentStatus,
  currentArtistId,
  scheduleData,
  isUpdating,
  statusOptions,
  artists,
  onStatusChange,
  onArtistChange,
  onScheduleChange,
  onDateChange,
  onTimeChange,
}: BookingManagementProps) => {
  return (
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
                onValueChange={onStatusChange}
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
                onValueChange={onArtistChange}
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduleData.date}
                    onSelect={onDateChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={scheduleData.time}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="flex-1"
                />
              </div>

              <Button
                className="w-full"
                onClick={onScheduleChange}
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
  );
};
