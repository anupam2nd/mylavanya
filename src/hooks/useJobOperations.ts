
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

export const useJobOperations = (bookings: Booking[], setBookings: React.Dispatch<React.SetStateAction<Booking[]>>) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);

  // Function to handle adding a new job
  const handleAddNewJob = (booking: Booking) => {
    setSelectedBookingForNewJob(booking);
    setShowNewJobDialog(true);
  };

  // Function to handle new job creation success
  const handleNewJobSuccess = (newBooking: Booking) => {
    setBookings(prevBookings => [newBooking, ...prevBookings]);
    setShowNewJobDialog(false);
    
    toast({
      title: "Success!",
      description: "New job has been added to this booking",
    });
  };

  // Function to handle job deletion (admin only)
  const handleDeleteJob = async (booking: Booking) => {
    if (user?.role !== 'admin') return;
    
    try {
      const { error } = await supabase
        .from('BookMST')
        .delete()
        .eq('id', booking.id);

      if (error) {
        throw error;
      }

      // Update local state
      setBookings(bookings.filter(b => b.id !== booking.id));
      
      toast({
        title: "Job deleted",
        description: `Job #${booking.jobno} has been deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error deleting job",
        description: "An error occurred while trying to delete the job",
      });
    }
  };

  // Function to handle schedule changes (admin only)
  const handleScheduleChange = async (booking: Booking, date: string, time: string) => {
    if (user?.role !== 'admin') return;
    
    try {
      const { error } = await supabase
        .from('BookMST')
        .update({
          Booking_date: date,
          booking_time: time
        })
        .eq('id', booking.id);

      if (error) {
        throw error;
      }

      // Update local state
      const bookingIndex = bookings.findIndex(b => b.id === booking.id);
      if (bookingIndex !== -1) {
        const updatedBooking = {
          ...booking,
          Booking_date: date,
          booking_time: time
        };
        
        const updatedBookings = [...bookings];
        updatedBookings[bookingIndex] = updatedBooking;
        setBookings(updatedBookings);
      }
      
      toast({
        title: "Schedule updated",
        description: `Booking schedule has been updated to ${date} at ${time}`,
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        variant: "destructive",
        title: "Error updating schedule",
        description: "An error occurred while trying to update the schedule",
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
