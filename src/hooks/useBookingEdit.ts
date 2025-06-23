
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
      const now = new Date();

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
      if (values.status && values.status !== editBooking.Status) {
        // Get the status_name for the selected status_code
        const { data: statusData, error: statusError } = await supabase
          .from('statusmst')
          .select('status_name')
          .eq('status_code', values.status)
          .single();
          
        if (statusError) {
          console.error("Error fetching status name:", statusError);
          throw new Error("Could not retrieve status information");
        }
        
        // Update both status fields with the status_name for better readability
        updates.Status = statusData?.status_name || values.status;
        updates.StatusUpdated = now.toISOString();
        
        // For certain statuses, also assign artists
        const artistAssignmentStatuses = ['process', 'approve', 'ontheway', 'service_started', 'done', 'beautician_assigned'];
        if (artistAssignmentStatuses.includes(values.status)) {
          // Try to get artist details if an artist ID was provided
          if (values.artistId) {
            try {
              const { data: artistData, error: artistError } = await supabase
                .from('ArtistMST')
                .select('ArtistFirstName, ArtistLastName, ArtistId, ArtistEmpCode')
                .eq('ArtistId', values.artistId)
                .single();
                
              if (!artistError && artistData) {
                // Construct full name from first and last name fields
                const artistFullName = `${artistData.ArtistFirstName || ''} ${artistData.ArtistLastName || ''}`.trim();
                updates.Assignedto = artistFullName;
                updates.ArtistId = artistData.ArtistId;
                updates.AssignedToEmpCode = artistData.ArtistEmpCode;
                
                // Set the assignment time
                updates.AssingnedON = now.toISOString();
                
                console.log(`Assigning artist ${artistFullName} to booking`);
              }
            } catch (error) {
              console.error('Error fetching artist details:', error);
            }
          }
        }
        
        // Set AssignedBY and AssignedByUser from currentUser data
        if (values.currentUser) {
          // Debug the currentUser object to see what's available
          console.log("Current User data for assignment:", JSON.stringify(values.currentUser));
          
          // Always set AssignedBY to the user's role (if available)
          if (values.currentUser.role) {
            updates.AssignedBY = values.currentUser.role;
            console.log("Setting AssignedBY to user role:", updates.AssignedBY);
          }
          
          // First verify if email_id exists in UserMST to avoid foreign key constraint violation
          if (values.currentUser.email_id) {
            // Verify the email_id exists in the UserMST table
            const { data: userData, error: userError } = await supabase
              .from('UserMST')
              .select('email_id')
              .eq('email_id', values.currentUser.email_id)
              .single();
              
            if (!userError && userData) {
              // email_id exists in UserMST, safe to use as AssignedByUser
              updates.AssignedByUser = values.currentUser.email_id;
              console.log("Setting AssignedByUser to email_id (verified in UserMST):", values.currentUser.email_id);
            } else {
              console.warn("email_id not found in UserMST, cannot set AssignedByUser");
              // Do not set AssignedByUser to avoid foreign key constraint violation
            }
          } else if (values.currentUser.email) {
            // Verify the email exists in the UserMST table as email_id
            const { data: userData, error: userError } = await supabase
              .from('UserMST')
              .select('email_id')
              .eq('email_id', values.currentUser.email)
              .single();
              
            if (!userError && userData) {
              updates.AssignedByUser = values.currentUser.email;
              console.log("Setting AssignedByUser to email (verified in UserMST):", values.currentUser.email);
            } else {
              console.warn("Email not found in UserMST as email_id, cannot set AssignedByUser");
              // Do not set AssignedByUser to avoid foreign key constraint violation
            }
          } else {
            console.warn("No email_id or email available in currentUser, cannot set AssignedByUser");
          }
          
          // If AssignedBY is still not set, use fallback
          if (!updates.AssignedBY) {
            // If no role is available, fall back to name or email_id
            if (values.currentUser.FirstName || values.currentUser.LastName) {
              const fullName = `${values.currentUser.FirstName || ''} ${values.currentUser.LastName || ''}`.trim();
              updates.AssignedBY = fullName || 'unknown';
            } else if (values.currentUser.email_id) {
              updates.AssignedBY = values.currentUser.email_id;
            } else {
              updates.AssignedBY = 'unknown';
            }
          }
        } else {
          // No user data available, do not set AssignedByUser to avoid foreign key constraint violation
          updates.AssignedBY = 'unknown';
        }
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
