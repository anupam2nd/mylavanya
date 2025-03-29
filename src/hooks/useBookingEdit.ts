
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
      // Prepare updates with all fields that might change
      const updates: Partial<Booking> = {};
      
      // Basic booking details
      if (values.date) {
        updates.Booking_date = format(values.date, 'yyyy-MM-dd');
      }
      if (values.time) {
        updates.booking_time = values.time;
      }
      if (values.status !== editBooking.Status) {
        updates.Status = values.status;
        // Update StatusUpdated timestamp whenever status changes
        updates.StatusUpdated = new Date().toISOString();
      }
      
      // Service details
      if (values.service && values.service !== editBooking.ServiceName) {
        updates.ServiceName = values.service;
      }
      if (values.subService && values.subService !== editBooking.SubService) {
        updates.SubService = values.subService;
      }
      if (values.product && values.product !== editBooking.ProductName) {
        updates.ProductName = values.product;
        
        // Fetch and update price from PriceMST when product changes
        try {
          const { data: priceData } = await supabase
            .from('PriceMST')
            .select('NetPayable, prod_id')
            .eq('ProductName', values.product)
            .eq('Services', values.service || editBooking.ServiceName || '')
            .eq('Subservice', values.subService || editBooking.SubService || '')
            .eq('active', true)
            .single();
          
          if (priceData) {
            updates.price = priceData.NetPayable || priceData.NetPayable === 0 ? priceData.NetPayable : null;
            updates.prod_id = priceData.prod_id;
          }
        } catch (error) {
          console.error('Error fetching product price:', error);
        }
      }

      // Quantity
      if (values.quantity && values.quantity !== editBooking.Qty) {
        updates.Qty = values.quantity;
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
          const { data: artistData } = await supabase
            .from('ArtistMST')
            .select('ArtistFirstName, ArtistLastName')
            .eq('ArtistId', values.artistId)
            .single();
          
          if (artistData) {
            const artistName = `${artistData.ArtistFirstName || ''} ${artistData.ArtistLastName || ''}`.trim();
            updates.Assignedto = artistName || `Artist ${values.artistId}`;
          }
        } catch (error) {
          console.error('Error fetching artist details:', error);
        }
        
        // If status is changing to beautician_assigned, update AssignedON
        if (values.status === 'beautician_assigned' && editBooking.Status !== 'beautician_assigned') {
          updates.AssingnedON = new Date().toISOString();
        }
        
        // Set AssignedBY to current user's username or "admin" as fallback
        updates.AssignedBY = values.currentUser?.Username || 'admin';
      }

      console.log("Updating booking with id:", editBooking.id, "Updates:", updates);

      // Only proceed if we have updates
      if (Object.keys(updates).length === 0) {
        setOpenDialog(false);
        return;
      }

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
