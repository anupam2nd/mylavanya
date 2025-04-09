
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

export const useJobOperations = (bookings: Booking[], setBookings: React.Dispatch<React.SetStateAction<Booking[]>>) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);

  // Function to handle adding a new job
  const handleAddNewJob = (booking: Booking) => {
    setSelectedBookingForNewJob(booking);
    setShowNewJobDialog(true);
  };

  // Function to handle successful job addition
  const handleNewJobSuccess = (newJob: Booking) => {
    setBookings((prevBookings) => [...prevBookings, newJob]);
    setShowNewJobDialog(false);
    toast({
      title: "Success",
      description: "New job added successfully",
    });
  };

  // Function to handle job deletion
  const handleDeleteJob = async (booking: Booking) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("BookMST")
        .delete()
        .eq("id", booking.id);

      if (error) {
        console.error("Error deleting job:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete job. Please try again later.",
        });
        return;
      }

      setBookings((prevBookings) =>
        prevBookings.filter((b) => b.id !== booking.id)
      );

      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (error) {
      console.error("Error in handleDeleteJob:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };

  // Function to handle job schedule change
  const handleScheduleChange = async (booking: Booking, date: string, time: string) => {
    try {
      const { error } = await supabase
        .from("BookMST")
        .update({
          Booking_date: date,
          booking_time: time,
        })
        .eq("id", booking.id);

      if (error) {
        console.error("Error updating schedule:", error);
        toast({
          variant: "destructive",
          title: "Failed to update schedule",
          description: error.message,
        });
        return;
      }

      // Create notification for schedule change if admin is making the change
      if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'user') {
        try {
          if (!booking.email) return;
          
          const adminName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'An administrator';
          
          const notificationMessage = {
            recipient_email: booking.email,
            booking_id: booking.id,
            booking_no: booking.Booking_NO,
            message: `${adminName} has rescheduled your booking ${booking.Booking_NO} to ${date} at ${time}.`,
            created_at: new Date().toISOString(),
            is_read: false,
            change_type: 'reschedule'
          };
          
          await supabase
            .from('notifications')
            .insert([notificationMessage]);
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.id === booking.id
            ? { ...b, Booking_date: date, booking_time: time }
            : b
        )
      );

      toast({
        title: "Schedule updated",
        description: `Booking scheduled for ${date} at ${time}`,
      });
    } catch (error) {
      console.error("Error in handleScheduleChange:", error);
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
    handleScheduleChange,
  };
};
