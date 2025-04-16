import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

export const useBookingStatusManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statusOptions, setStatusOptions] = useState<{status_code: string; status_name: string}[]>([]);

  // Fetch status options from the database
  const fetchStatusOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('statusmst')
        .select('status_code, status_name')
        .eq('active', true);

      if (error) {
        console.error("Error fetching status options:", error);
        return;
      }

      setStatusOptions(data || []);
    } catch (error) {
      console.error("Error in fetchStatusOptions:", error);
    }
  };

  // Create notification using direct insert instead of RPC
  const createNotification = async (booking: Booking, changeType: string) => {
    if (!booking.email) return;
    
    try {
      const adminName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'An administrator';
      
      // Create notification message
      const notificationData = {
        recipient_email: booking.email,
        booking_id: booking.id,
        booking_no: booking.Booking_NO || '',
        message: `${adminName} has updated the ${changeType} of your booking ${booking.Booking_NO || ''}.`,
        is_read: false,
        change_type: changeType
      };
      
      // Use direct insert
      const { error } = await supabase
        .from('notifications')
        .insert([notificationData]);
        
      if (error) {
        console.error("Error creating notification:", error);
      }
    } catch (error) {
      console.error("Error in createNotification:", error);
    }
  };

  // Handle status change for a booking
  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('BookMST')
        .update({ Status: newStatus, StatusUpdated: new Date().toISOString() })
        .eq('id', booking.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to update status",
          description: error.message,
        });
        return;
      }

      // Create notification for status change
      if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'user') {
        await createNotification(booking, 'status');
      }

      toast({
        title: "Status updated",
        description: `Booking status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: "An unexpected error occurred",
      });
    }
  };

  // Handle artist assignment - Now uses UUID string for artistId
  const handleArtistAssignment = async (booking: Booking, artistId: string) => {
    try {
      if (!artistId) {
        console.error("Invalid artist ID:", artistId);
        toast({
          variant: "destructive",
          title: "Invalid artist selection",
          description: "Please select a valid artist",
        });
        return;
      }

      // Get the artist from the database
      const { data: artistData, error: artistError } = await supabase
        .from('ArtistMST')
        .select('ArtistFirstName, ArtistLastName')
        .eq('ArtistId', artistId)
        .single();

      if (artistError) {
        console.error("Error fetching artist:", artistError);
        toast({
          variant: "destructive",
          title: "Failed to find artist",
          description: artistError.message,
        });
        return;
      }

      const artistName = `${artistData.ArtistFirstName || ''} ${artistData.ArtistLastName || ''}`.trim() || `Artist ${artistId}`;
      
      const { error } = await supabase
        .from('BookMST')
        .update({ 
          ArtistId: artistId,
          Assignedto: artistName,
          AssingnedON: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) {
        console.error("Error assigning artist:", error);
        toast({
          variant: "destructive",
          title: "Failed to assign artist",
          description: error.message,
        });
        return;
      }

      // Create notification for artist assignment
      if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'user') {
        await createNotification(booking, 'artist assignment');
      }

      toast({
        title: "Artist assigned",
        description: `Booking assigned to ${artistName}`,
      });
    } catch (error) {
      console.error("Error assigning artist:", error);
      toast({
        variant: "destructive",
        title: "Error assigning artist",
        description: "An unexpected error occurred",
      });
    }
  };

  return { 
    statusOptions, 
    fetchStatusOptions: async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name')
          .eq('active', true);

        if (error) {
          console.error("Error fetching status options:", error);
          return;
        }

        setStatusOptions(data || []);
      } catch (error) {
        console.error("Error in fetchStatusOptions:", error);
      }
    },
    handleStatusChange, 
    handleArtistAssignment 
  };
};
