
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

export const useJobOperations = (
  bookings: Booking[],
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
) => {
  const { toast } = useToast();
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);

  const handleAddNewJob = (booking: Booking) => {
    setSelectedBookingForNewJob(booking);
    setShowNewJobDialog(true);
  };

  const handleNewJobSuccess = (newJob: Booking) => {
    // Add the new job to the bookings list
    setBookings([newJob, ...bookings]);
    toast({
      title: "New job added",
      description: `Job #${newJob.jobno} has been added to booking ${newJob.Booking_NO}`,
    });
  };

  const handleDeleteJob = async (booking: Booking): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete job #${booking.jobno}?`)) {
      return;
    }

    try {
      // Convert booking.id to number for database operation
      const bookingIdNumber = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .delete()
        .eq('id', bookingIdNumber);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to delete job",
          description: error.message,
        });
        return;
      }

      // Update local state - remove the deleted job
      setBookings(bookings.filter(b => b.id !== booking.id));

      // Check if this was the only job for this booking
      const remainingJobsForBooking = bookings.filter(
        b => b.id !== booking.id && b.Booking_NO === booking.Booking_NO
      );

      const message = remainingJobsForBooking.length
        ? `Job #${booking.jobno} has been deleted`
        : `Booking ${booking.Booking_NO} and Job #${booking.jobno} have been deleted`;

      toast({
        title: "Job deleted",
        description: message,
      });

      // Create notification for customer
      if (booking.email) {
        // Convert booking.id to number for database operation if needed
        const bookingIdNumber = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
        
        const notificationData = [{
          recipient_email: booking.email,
          booking_id: bookingIdNumber,
          booking_no: booking.Booking_NO || '',
          message: `Your job #${booking.jobno} has been canceled.`,
          is_read: false,
          change_type: 'job_deleted'
        }];

        await supabase
          .from('notifications')
          .insert(notificationData);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error deleting job",
        description: "An unexpected error occurred",
      });
    }
  };

  const handleScheduleChange = async (
    booking: Booking,
    date: string,
    time: string
  ): Promise<void> => {
    try {
      // Convert booking.id to number for database operation
      const bookingIdNumber = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .update({
          Booking_date: date,
          booking_time: time
        })
        .eq('id', bookingIdNumber);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to update schedule",
          description: error.message,
        });
        return;
      }

      // Update local state
      const updatedBookings = bookings.map(b =>
        b.id === booking.id
          ? { ...b, Booking_date: date, booking_time: time }
          : b
      );
      
      setBookings(updatedBookings);

      toast({
        title: "Schedule updated",
        description: `Job #${booking.jobno} rescheduled to ${date} at ${time}`,
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        variant: "destructive",
        title: "Error updating schedule",
        description: "An unexpected error occurred",
      });
    }
  };

  return {
    showNewJobDialog,
    setShowNewJobDialog,
    selectedBookingForNewJob,
    handleAddNewJob,
    handleNewJobSuccess,
    handleDeleteJob,
    handleScheduleChange
  };
};
