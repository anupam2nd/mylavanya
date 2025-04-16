
import { useState } from "react";
import { Booking } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";

export const useNewJobDialog = () => {
  const { toast } = useToast();
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);

  const handleAddNewJob = (booking: Booking) => {
    setSelectedBookingForNewJob(booking);
    setShowNewJobDialog(true);
  };

  const handleNewJobSuccess = (newBooking: Booking) => {
    setShowNewJobDialog(false);
    toast({
      title: "Success!",
      description: "New job has been added to this booking",
    });
  };

  return {
    showNewJobDialog,
    setShowNewJobDialog,
    selectedBookingForNewJob,
    handleAddNewJob,
    handleNewJobSuccess,
  };
};
