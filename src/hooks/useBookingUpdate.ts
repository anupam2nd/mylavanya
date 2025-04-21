
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
          // Get the artist's employee code
          const { data: artistData, error: artistError } = await supabase
            .from('ArtistMST')
            .select('ArtistEmpCode')
            .eq('ArtistId', parseInt(artistId))
            .single();
            
          if (artistError) {
            console.error('Error fetching artist employee code:', artistError);
          } else if (artistData?.ArtistEmpCode) {
            updates.AssignedToEmpCode = artistData.ArtistEmpCode;
          }
          
          updates.ArtistId = parseInt(artistId);
          updates.Assignedto = formValues.currentUser?.Username || 'admin';
          updates.AssignedBY = formValues.currentUser?.Username || 'admin';
          updates.AssingnedON = new Date().toISOString();
        } else {
          // Get a default artist with an employee code
          const { data: defaultArtist } = await supabase
            .from("ArtistMST")
            .select("ArtistEmpCode")
            .filter("ArtistEmpCode", "not.is", null)
            .eq("Active", true)
            .limit(1)
            .single();
            
          updates.AssignedToEmpCode = defaultArtist?.ArtistEmpCode || "UNASSIGNED";
          updates.ArtistId = null;
          updates.Assignedto = null;
        }
      }

      // Convert booking.id to a number for the query if it's a string
      const bookingId = typeof editBooking.id === 'string' ? parseInt(editBooking.id) : editBooking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .update(updates)
        .eq('id', bookingId);

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
