
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

export const useBookingCRUD = (bookings: Booking[], setBookings: (bookings: Booking[]) => void) => {
  const { toast } = useToast();

  const handleDeleteJob = async (booking: Booking) => {
    try {      
      const { error } = await supabase
        .from('BookMST')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;
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

  const handleScheduleChange = async (booking: Booking, date: string, time: string) => {
    try {      
      const { error } = await supabase
        .from('BookMST')
        .update({
          Booking_date: date,
          booking_time: time
        })
        .eq('id', booking.id);

      if (error) throw error;
      const updatedBookings = bookings.map(b => 
        b.id === booking.id 
          ? { ...b, Booking_date: date, booking_time: time } 
          : b
      );
      setBookings(updatedBookings);
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
    handleDeleteJob,
    handleScheduleChange,
  };
};
