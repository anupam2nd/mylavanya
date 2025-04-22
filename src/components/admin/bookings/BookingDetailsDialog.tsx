import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";
import { CustomerInfo } from "./dialog/CustomerInfo";
import { BookingManagement } from "./dialog/BookingManagement";
import { ServiceManagement } from "./dialog/ServiceManagement";
import { BookingsTable } from "./dialog/BookingsTable";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
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
    
    if (newStatus === 'Beautician_assigned' && !currentArtistId) {
      toast({
        variant: "destructive",
        title: "Artist Required",
        description: "Please assign an artist before changing status to Beautician Assigned.",
      });
      return;
    }
    
    setIsUpdating((prev) => ({ ...prev, status: true }));
    try {
      await onStatusChange(booking, newStatus);
      setCurrentStatus(newStatus);
      
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

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Booking Details #{booking.Booking_NO}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription>
            Manage services, schedules, and assignments for this booking
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomerInfo booking={booking} />
          <BookingManagement
            booking={booking}
            currentStatus={currentStatus}
            currentArtistId={currentArtistId}
            scheduleData={scheduleData}
            isUpdating={isUpdating}
            statusOptions={statusOptions}
            artists={artists}
            onStatusChange={handleStatusChangeWrapper}
            onArtistChange={handleArtistAssignmentWrapper}
            onScheduleChange={handleScheduleChangeWrapper}
            onDateChange={(date) => setScheduleData(prev => ({ ...prev, date }))}
            onTimeChange={(time) => setScheduleData(prev => ({ ...prev, time }))}
          />
        </div>

        <div className="my-4">
          <ServiceManagement 
            booking={booking}
            onServiceAdded={() => window.location.reload()}
          />
          
          <BookingsTable 
            bookings={relatedBookings}
            artists={artists}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
