
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditBookingFormValues } from "@/components/admin/bookings/EditBookingFormSchema";
import { Booking } from "./useBookings";

export const useBookingEdit = (bookings: Booking[], setBookings: (bookings: Booking[]) => void) => {
  const { toast } = useToast();
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleEditClick = (booking: Booking) => {
    setEditBooking(booking);
    setOpenDialog(true);
  };

  const handleSaveChanges = async (values: EditBookingFormValues) => {
    if (!editBooking) return;

    try {
      // Make sure we only include fields that actually exist in the database table
      const updates = {
        Booking_date: values.date ? format(values.date, 'yyyy-MM-dd') : editBooking.Booking_date,
        booking_time: values.time,
        Status: values.status
      };

      console.log("Updating booking with id:", editBooking.id, "Updates:", updates);

      const { error } = await supabase
        .from('BookMST')
        .update(updates)
        .eq('id', editBooking.id);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === editBooking.id 
          ? { ...booking, ...updates } 
          : booking
      ));

      toast({
        title: "Booking updated",
        description: "The booking has been successfully updated",
      });

      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the booking",
        variant: "destructive"
      });
    }
  };

  return {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveChanges
  };
};
