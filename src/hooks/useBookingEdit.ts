
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/hooks/useBookings";

export const useBookingEdit = (bookings: Booking[], setBookings: React.Dispatch<React.SetStateAction<Booking[]>>) => {
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const handleEditClick = (booking: Booking) => {
    setEditBooking(booking);
    setOpenDialog(true);
  };

  const handleSaveChanges = async (values: any) => {
    try {
      if (!editBooking) return;

      const updates: any = {};

      // Only add values to updates if they changed or exist
      if (values.date) {
        updates.Booking_date = values.date.toISOString().split('T')[0];
      }
      
      if (values.time) {
        updates.booking_time = values.time;
      }
      
      if (values.service) {
        updates.ServiceName = values.service;
      }
      
      if (values.subService) {
        updates.SubService = values.subService;
      }
      
      if (values.product) {
        updates.ProductName = values.product;
      }
      
      if (values.quantity) {
        updates.Qty = values.quantity;
      }
      
      if (values.address) {
        updates.Address = values.address;
      }
      
      if (values.pincode) {
        updates.Pincode = values.pincode;
      }
      
      // Handle status update
      if (values.status) {
        // Update both status fields
        updates.Status = values.status;
      }
      
      // Handle artist assignment - Now uses UUID string
      if (values.artistId !== undefined) {
        console.log("Artist ID in handleSaveChanges:", values.artistId);
        updates.ArtistId = values.artistId;
        
        // Try to get artist details if an artist ID was provided
        if (values.artistId) {
          try {
            const { data: artistData, error: artistError } = await supabase
              .from('ArtistMST')
              .select('ArtistFirstName, ArtistLastName, ArtistId')
              .eq('ArtistId', values.artistId)
              .single();
              
            if (!artistError && artistData) {
              // Construct full name from first and last name fields
              const artistFullName = `${artistData.ArtistFirstName || ''} ${artistData.ArtistLastName || ''}`.trim();
              updates.Assignedto = artistFullName || `Artist ${artistData.ArtistId}`;
              console.log(`Assigning artist ${artistFullName} to booking`);
            }
          } catch (error) {
            console.error('Error fetching artist details:', error);
          }
        } else {
          // If artistId is null or undefined, clear the assignment
          updates.Assignedto = null;
        }
      }
      
      // Set AssignedBY from currentUser data
      if (values.currentUser) {
        // Debug the currentUser object to see what's available
        console.log("Current User data for AssignedBY:", JSON.stringify(values.currentUser));
        
        // Use the user's role as AssignedBY, ensuring we use the correct property
        if (values.currentUser.role) {
          updates.AssignedBY = values.currentUser.role;
          console.log("Setting AssignedBY to user role:", updates.AssignedBY);
        } 
        // If no role is available, fall back to name or username
        else if (values.currentUser.FirstName || values.currentUser.LastName) {
          const fullName = `${values.currentUser.FirstName || ''} ${values.currentUser.LastName || ''}`.trim();
          updates.AssignedBY = fullName;
          console.log("Falling back to user name for AssignedBY:", fullName);
        } 
        else if (values.currentUser.Username) {
          updates.AssignedBY = values.currentUser.Username;
          console.log("Falling back to username for AssignedBY:", values.currentUser.Username);
        }
        // Default if nothing else available
        else {
          updates.AssignedBY = 'unknown';
          console.log("No user info available, defaulting AssignedBY to 'unknown'");
        }
      } else {
        // No user data available
        updates.AssignedBY = 'unknown';
        console.log("No current user data, defaulting AssignedBY to 'unknown'");
      }
      
      // Update AssingnedON timestamp if artist is being assigned
      if (updates.ArtistId || updates.Assignedto) {
        updates.AssingnedON = new Date().toISOString();
      }
      
      console.log("Submitting booking updates:", updates);
      
      const { error } = await supabase
        .from('BookMST')
        .update(updates)
        .eq('id', editBooking.id);

      if (error) throw error;

      // Update the local state
      setBookings(bookings.map(booking => 
        booking.id === editBooking.id 
          ? { ...booking, ...updates } 
          : booking
      ));

      toast({
        title: "Success!",
        description: "Booking has been updated",
      });

      setOpenDialog(false);
      
    } catch (error: any) {
      console.error('Error updating booking:', error);
      
      toast({
        title: "Error updating booking",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
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
