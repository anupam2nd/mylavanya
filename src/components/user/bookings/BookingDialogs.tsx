
import { useState } from "react";
import { Booking } from "@/hooks/useBookings";
import EditBookingDialog from "./EditBookingDialog";
import NewJobDialog from "./NewJobDialog";
import { useBookingEdit } from "@/hooks/useBookingEdit";
import { useToast } from "@/hooks/use-toast";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { logger } from "@/utils/logger";

interface BookingDialogsProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  currentUser: { Username?: string, FirstName?: string, LastName?: string, role?: string } | null;
}

const BookingDialogs = ({ bookings, setBookings, currentUser }: BookingDialogsProps) => {
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);
  const { toast } = useToast();
  const { statusOptions } = useStatusOptions();

  logger.debug("BookingDialogs component loaded");

  const {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveChanges
  } = useBookingEdit(bookings, setBookings);

  const handleAddNewJob = (booking: Booking) => {
    setSelectedBookingForNewJob(booking);
    setShowNewJobDialog(true);
  };

  const handleNewJobSuccess = (newBooking: Booking) => {
    // Update the type to use setState properly
    setBookings((prevBookings) => [newBooking, ...prevBookings]);
    setShowNewJobDialog(false);
    
    toast({
      title: "Success!",
      description: "New job has been added to this booking",
    });
  };

  return {
    dialogs: (
      <>
        <EditBookingDialog
          booking={editBooking}
          open={openDialog}
          onOpenChange={setOpenDialog}
          onSave={async (booking, updates) => {
            const formValues = {
              date: updates.Booking_date ? new Date(updates.Booking_date) : undefined,
              time: updates.booking_time || "",
              status: updates.Status || "",
              service: updates.ServiceName || "",
              subService: updates.SubService || "",
              product: updates.ProductName || "",
              quantity: updates.Qty || 1,
              address: updates.Address || "",
              pincode: updates.Pincode?.toString() || "",
              artistId: updates.ArtistId || null,
              currentUser
            };
            
            logger.debug("EditBookingDialog saving changes");
            await handleSaveChanges(formValues);
          }}
          statusOptions={statusOptions}
          currentUser={currentUser}
        />
        
        <NewJobDialog
          open={showNewJobDialog}
          onOpenChange={setShowNewJobDialog}
          booking={selectedBookingForNewJob}
          onSuccess={handleNewJobSuccess}
          currentUser={currentUser}
        />
      </>
    ),
    handleEditClick,
    handleAddNewJob
  };
};

export default BookingDialogs;
