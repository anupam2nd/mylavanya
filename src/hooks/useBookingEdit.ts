
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditBookingFormValues } from "@/components/admin/bookings/EditBookingFormSchema";
import { Booking } from "./useBookings"; // Ensure we're using the same Booking type

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
      
      // Quantity and price update
      if (values.quantity && values.quantity !== editBooking.Qty) {
        updates.Qty = values.quantity;
        
        // Fetch the NetPayable price from PriceMST for this product and calculate the total price
        if (editBooking.prod_id) {
          try {
            const { data: priceData, error: priceError } = await supabase
              .from('PriceMST')
              .select('NetPayable')
              .eq('prod_id', editBooking.prod_id)
              .maybeSingle();
            
            if (priceError) {
              console.error('Error fetching product price:', priceError);
              throw priceError;
            }
            
            if (priceData && priceData.NetPayable) {
              const unitPrice = priceData.NetPayable;
              updates.price = unitPrice * values.quantity;
              console.log(`Price calculated: ${unitPrice} × ${values.quantity} = ${updates.price}`);
            } else {
              console.warn('No price found for product ID:', editBooking.prod_id);
              
              // Fallback to existing price calculation if no product price found
              if (editBooking.price !== undefined && editBooking.Qty !== undefined) {
                const unitPrice = editBooking.price / editBooking.Qty;
                updates.price = unitPrice * values.quantity;
                console.log(`Fallback price calculated: ${unitPrice} × ${values.quantity} = ${updates.price}`);
              }
            }
          } catch (error) {
            console.error('Error calculating price from PriceMST:', error);
            toast({
              title: "Price calculation warning",
              description: "Could not retrieve product price. Using estimated calculation.",
              variant: "destructive"
            });
            
            // Use fallback calculation
            if (editBooking.price !== undefined && editBooking.Qty !== undefined) {
              const unitPrice = editBooking.price / editBooking.Qty;
              updates.price = unitPrice * values.quantity;
            }
          }
        } else {
          console.warn('No product ID available for price lookup');
          
          // Fallback to existing price calculation if no product ID
          if (editBooking.price !== undefined && editBooking.Qty !== undefined) {
            const unitPrice = editBooking.price / editBooking.Qty;
            updates.price = unitPrice * values.quantity;
          }
        }
      }

      // Artist assignment - Fixed to handle all statuses that require artist assignment
      const assignmentStatuses = ['beautician_assigned', 'on_the_way', 'service_started', 'done', 'OnTheway', 'Start'];
      const requiresArtist = assignmentStatuses.includes(values.status);
      
      if (requiresArtist && values.artistId) {
        // Always update artist ID when a valid artist is selected for relevant statuses
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
        
        // Set AssignedBY to current user's full name instead of just username
        if (values.currentUser) {
          const firstName = values.currentUser.FirstName || '';
          const lastName = values.currentUser.LastName || '';
          
          if (firstName || lastName) {
            updates.AssignedBY = `${firstName} ${lastName}`.trim();
          } else {
            // Fallback to username if no name is available
            updates.AssignedBY = values.currentUser.Username || 'admin';
          }
        } else {
          updates.AssignedBY = 'admin';
        }
        
        // Set AssignedON to current timestamp if status is changing to one requiring artist
        // or if artist is changing
        if (!editBooking.ArtistId || 
            editBooking.Status !== values.status || 
            editBooking.ArtistId !== values.artistId) {
          updates.AssingnedON = new Date().toISOString();
        }
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
      
      if (updates.Qty !== undefined && updates.Qty !== null) {
        updates.Qty = Number(updates.Qty);
      }
      
      if (updates.price !== undefined && updates.price !== null) {
        updates.price = Number(updates.price);
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
