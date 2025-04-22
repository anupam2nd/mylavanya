
import React from "react";
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
import { useBookingDetails } from "@/hooks/useBookingDetails";
import { format } from "date-fns";

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
  const {
    isUpdating,
    scheduleData,
    currentStatus,
    currentArtistId,
    setScheduleData,
    handleStatusChangeWrapper,
    handleArtistAssignmentWrapper,
    handleScheduleChangeWrapper
  } = useBookingDetails(
    booking,
    onStatusChange,
    onArtistAssignment,
    onScheduleChange,
    relatedBookings
  );

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
