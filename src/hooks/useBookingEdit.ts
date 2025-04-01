
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
      
      // Service details
      if (values.service && values.service !== editBooking.ServiceName) {
        updates.ServiceName = values.service;
      }
      if (values.subService && values.subService !== editBooking.SubService) {
        updates.SubService = values.subService;
      }

      // Product details - handle ProductName updates carefully
      if (values.product && values.product !== editBooking.ProductName) {
        console.log("Updating product from", editBooking.ProductName, "to", values.product);
        updates.ProductName = values.product;
        
        // Fetch and update price and prod_id from PriceMST when product changes
        try {
          console.log("Fetching price for product:", values.product);
          const { data: priceData, error: priceError } = await supabase
            .from('PriceMST')
            .select('NetPayable, prod_id, Price')
            .eq('ProductName', values.product)
            .eq('active', true)
            .maybeSingle();
          
          if (priceError) {
            console.error('Error fetching product price:', priceError);
            throw priceError;
          }
          
          if (priceData) {
            console.log("Found price data:", priceData);
            
            // Update price with NetPayable if available, otherwise use null
            if (priceData.NetPayable !== undefined && priceData.NetPayable !== null) {
              updates.price = priceData.NetPayable;
            } else if (priceData.Price !== undefined && priceData.Price !== null) {
              updates.price = priceData.Price;
            } else {
              updates.price = null;
            }
            
            // Make sure to set the prod_id from PriceMST
            if (priceData.prod_id !== undefined) {
              updates.prod_id = priceData.prod_id;
              console.log("Setting prod_id to:", priceData.prod_id, "type:", typeof priceData.prod_id);
            } else {
              console.warn("No prod_id found in PriceMST for product:", values.product);
              updates.prod_id = null;
            }
          } else {
            console.warn("No price data found for product:", values.product);
            // If no price data found, explicitly set to null to avoid inconsistencies
            updates.price = null;
            updates.prod_id = null;
          }
        } catch (error) {
          console.error('Error fetching product price:', error);
          // Continue with the update even if price fetch fails
          updates.price = null;
          updates.prod_id = null;
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
      if (updates.prod_id !== undefined) {
        if (updates.prod_id === null) {
          console.log("Setting prod_id to null");
        } else {
          console.log("Setting prod_id to:", updates.prod_id);
          // Explicitly convert to number to ensure correct type
          updates.prod_id = Number(updates.prod_id);
        }
      }
      
      if (updates.ArtistId !== undefined && updates.ArtistId !== null) {
        updates.ArtistId = Number(updates.ArtistId);
      }
      
      if (updates.price !== undefined && updates.price !== null) {
        updates.price = Number(updates.price);
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
