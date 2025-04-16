
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

export const useBookingUpdate = (bookings: Booking[], setBookings: (bookings: Booking[]) => void) => {
  const { toast } = useToast();
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleEditClick = (booking: Booking) => {
    setEditBooking(booking);
    setOpenDialog(true);
  };

  const handleSaveWithUserData = async (formValues: any) => {
    try {
      if (!editBooking) return;
      
      const { date, time, status, address, pincode, artistId } = formValues;
      
      const updates: any = {};
      
      if (date) updates.Booking_date = new Date(date).toISOString().split('T')[0];
      if (time) updates.booking_time = time;
      if (status) updates.Status = status;
      if (address !== undefined) updates.Address = address;
      if (pincode !== undefined) updates.Pincode = pincode ? parseInt(pincode) : null;
      
      if (artistId !== undefined) {
        if (artistId) {
          updates.ArtistId = artistId;
          updates.Assignedto = formValues.currentUser?.Username || 'admin';
          updates.AssignedBY = formValues.currentUser?.Username || 'admin';
          updates.AssingnedON = new Date().toISOString();
        } else {
          updates.ArtistId = null;
          updates.Assignedto = null;
        }
      }

      const { error } = await supabase
        .from('BookMST')
        .update(updates)
        .eq('id', editBooking.id);

      if (error) throw error;
      
      const updatedBookings = bookings.map(b => 
        b.id === editBooking.id ? { ...b, ...updates } : b
      );
      
      setBookings(updatedBookings);
      
      toast({
        title: "Booking updated",
        description: "The booking has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        variant: "destructive",
        title: "Failed to update booking",
        description: "An error occurred while updating the booking",
      });
    }
  };

  return {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveWithUserData,
  };
};
