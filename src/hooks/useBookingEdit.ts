import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

interface FormValues {
  date?: Date;
  time?: string;
  status?: string;
  service?: string;
  subService?: string;
  product?: string;
  quantity?: number;
  address?: string;
  pincode?: string;
  artistId?: string | null;
  currentUser?: { Username?: string } | null;
}

export const useBookingEdit = (
  bookings: Booking[],
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
) => {
  const { toast } = useToast();
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleEditClick = (booking: Booking) => {
    setEditBooking(booking);
    setOpenDialog(true);
  };

  const handleSaveChanges = async (formValues: FormValues) => {
    try {
      if (!editBooking) return;

      // Convert booking.id to number for database operation
      const bookingIdNumber = typeof editBooking.id === 'string' ? parseInt(editBooking.id) : editBooking.id;
      
      const updates: Record<string, any> = {};

      if (formValues.date) {
        updates.Booking_date = formValues.date.toISOString().split('T')[0];
      }

      if (formValues.time) {
        updates.booking_time = formValues.time;
      }

      if (formValues.status) {
        updates.Status = formValues.status;
        updates.StatusUpdated = new Date().toISOString();
      }

      if (formValues.service) {
        updates.ServiceName = formValues.service;
      }

      if (formValues.subService !== undefined) {
        updates.SubService = formValues.subService;
      }

      if (formValues.product !== undefined) {
        updates.ProductName = formValues.product;
      }

      if (formValues.quantity) {
        updates.Qty = formValues.quantity;
      }

      if (formValues.address !== undefined) {
        updates.Address = formValues.address;
      }

      if (formValues.pincode !== undefined) {
        updates.Pincode = formValues.pincode ? parseInt(formValues.pincode) : null;
      }

      if (formValues.artistId !== undefined) {
        if (formValues.artistId) {
          // Convert artistId string to number for database
          const numericArtistId = parseInt(formValues.artistId);
          updates.ArtistId = numericArtistId;
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
        .eq('id', bookingIdNumber);

      if (error) throw error;

      const updatedBooking = { ...editBooking, ...updates };
      
      // For ArtistId, keep as string in the frontend
      if (updates.ArtistId !== undefined) {
        updatedBooking.ArtistId = formValues.artistId;
      }

      const updatedBookings = bookings.map(b => 
        b.id === editBooking.id ? updatedBooking : b
      );
      
      setBookings(updatedBookings);

      toast({
        title: "Booking updated",
        description: "The booking has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the booking.",
      });
    }
  };

  return {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveChanges,
  };
};
