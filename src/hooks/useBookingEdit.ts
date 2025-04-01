
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
      console.log("Starting to save changes for booking:", editBooking.id);
      console.log("Form values:", values);
      
      // Prepare updates with all fields that might change
      const updates: Partial<Booking> = {};
      
      // Always update StatusUpdated timestamp on any edit
      updates.StatusUpdated = new Date().toISOString();
      
      // Basic booking details
      if (values.date) {
        updates.Booking_date = format(values.date, 'yyyy-MM-dd');
      }
      if (values.time) {
        updates.booking_time = values.time;
      }
      if (values.status !== editBooking.Status) {
        updates.Status = values.status;
      }

      // Address details
      if (values.address && values.address !== editBooking.Address) {
        updates.Address = values.address;
      }
      if (values.pincode && values.pincode !== editBooking.Pincode?.toString()) {
        updates.Pincode = parseInt(values.pincode, 10);
      }

      // Artist assignment
      if (values.artistId && values.artistId !== editBooking.ArtistId) {
        updates.ArtistId = values.artistId;
        
        // Fetch artist name from ArtistMST
        try {
          const { data: artistData, error: artistError } = await supabase
            .from('ArtistMST')
            .select('ArtistFirstName, ArtistLastName')
            .eq('ArtistId', values.artistId)
            .maybeSingle();
          
          if (artistError) {
            console.error('Error fetching artist details:', artistError);
            throw artistError;
          }
          
          if (artistData) {
            const artistName = `${artistData.ArtistFirstName || ''} ${artistData.ArtistLastName || ''}`.trim();
            updates.Assignedto = artistName || `Artist ${values.artistId}`;
          }
        } catch (error) {
          console.error('Error fetching artist details:', error);
        }
        
        // Set AssignedBY to current user's username or "admin" as fallback
        updates.AssignedBY = values.currentUser?.Username || 'admin';
      }
      
      // Only update AssingnedON if status is changing to beautician_assigned
      if (values.status === 'beautician_assigned' && editBooking.Status !== 'beautician_assigned') {
        updates.AssingnedON = new Date().toISOString();
      }

      console.log("Updating booking with id:", editBooking.id, "Updates:", updates);

      // Only proceed if we have updates
      if (Object.keys(updates).length === 0) {
        setOpenDialog(false);
        return;
      }

      // Ensure all numeric fields are properly typed
      if (updates.ArtistId !== undefined && updates.ArtistId !== null) {
        updates.ArtistId = Number(updates.ArtistId);
      }

      if (updates.Pincode !== undefined && updates.Pincode !== null) {
        updates.Pincode = Number(updates.Pincode);
      }

      console.log("Final update payload:", updates);
      
      // Perform the update
      const { data, error } = await supabase
        .from('BookMST')
        .update(updates)
        .eq('id', editBooking.id)
        .select();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      console.log("Update response:", data);

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
