
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

export const useBookingCRUD = (
  bookings: Booking[],
  setBookings: (bookings: Booking[]) => void
) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);

  const handleDeleteJob = async (booking: Booking): Promise<void> => {
    if (isDeleting) return Promise.resolve();
    
    const confirmDelete = window.confirm(`Are you sure you want to delete job #${booking.jobno}?`);
    if (!confirmDelete) return Promise.resolve();
    
    try {
      setIsDeleting(true);
      
      // Convert booking ID to a number if it's a string
      const bookingId = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .delete()
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Remove the deleted booking from state
      setBookings(bookings.filter(b => b.id !== booking.id));
      
      toast({
        title: "Job deleted",
        description: `Job #${booking.jobno} has been deleted.`,
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting job:", error);
      
      toast({
        variant: "destructive",
        title: "Error deleting job",
        description: "There was an error deleting the job.",
      });
      
      return Promise.reject(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScheduleChange = async (booking: Booking, date: string, time: string): Promise<void> => {
    if (isUpdatingSchedule) return Promise.resolve();
    
    try {
      setIsUpdatingSchedule(true);
      
      // Convert booking ID to a number if it's a string
      const bookingId = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .update({ 
          Booking_date: date, 
          booking_time: time 
        })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Update the booking in state
      const updatedBookings = bookings.map(b => 
        b.id === booking.id 
          ? { ...b, Booking_date: date, booking_time: time } 
          : b
      );
      
      setBookings(updatedBookings);
      
      toast({
        title: "Schedule updated",
        description: `Booking has been rescheduled to ${date} at ${time}.`,
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating schedule:", error);
      
      toast({
        variant: "destructive",
        title: "Error updating schedule",
        description: "There was an error updating the schedule.",
      });
      
      return Promise.reject(error);
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  return {
    handleDeleteJob,
    handleScheduleChange,
    isDeleting,
    isUpdatingSchedule
  };
};
