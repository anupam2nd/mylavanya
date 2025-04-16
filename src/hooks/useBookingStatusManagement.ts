
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

export const useBookingStatusManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statusOptions, setStatusOptions] = useState<{status_code: string; status_name: string}[]>([]);

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

  const createNotification = async (booking: Booking, changeType: string, message: string) => {
    if (!booking.email) return;
    
    try {
      const adminName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'An administrator';
      
      const notificationData = {
        recipient_email: booking.email,
        booking_id: parseInt(booking.id), // Convert string to number for the notifications table
        booking_no: booking.Booking_NO || '',
        message,
        is_read: false,
        change_type: changeType
      };
      
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

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('BookMST')
        .update({ 
          Status: newStatus,
          StatusUpdated: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to update status",
          description: error.message,
        });
        return;
      }

      if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'user') {
        await createNotification(booking, 'status', `Booking status changed to ${newStatus}`);
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

      // Convert string artistId to number for database
      const numericArtistId = parseInt(artistId);

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
          ArtistId: numericArtistId, // Store as number in database
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

      if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'user') {
        await createNotification(booking, 'artist assignment', `Booking assigned to ${artistName}`);
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
    fetchStatusOptions, 
    handleStatusChange, 
    handleArtistAssignment 
  };
};
