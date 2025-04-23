
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

export const useBookingStatusManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statusOptions, setStatusOptions] = useState<{status_code: string; status_name: string; description?: string; active?: boolean}[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatusOptions = useCallback(async () => {
    // Don't fetch if we already have data
    if (statusOptions.length > 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('statusmst')
        .select('status_code, status_name, description, active')
        .eq('active', true);

      if (error) {
        console.error("Error fetching status options:", error);
        return;
      }

      setStatusOptions(data || []);
    } catch (error) {
      console.error("Error in fetchStatusOptions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusOptions.length]);

  useEffect(() => {
    fetchStatusOptions();
  }, [fetchStatusOptions]);

  const createNotification = async (booking: Booking, changeType: string, message: string) => {
    if (!booking.email) return;
    
    try {
      const adminName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'An administrator';
      
      // Convert booking.id to number for the notification
      const bookingIdNumber = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const notificationData = {
        recipient_email: booking.email,
        booking_id: bookingIdNumber,
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

  const handleStatusChange = async (booking: Booking, newStatus: string): Promise<void> => {
    if (isUpdatingStatus) return Promise.resolve();
    
    try {
      setIsUpdatingStatus(true);
      console.log("Starting status update for booking:", booking.id, "to status:", newStatus);
      
      // Find the corresponding status name
      const statusOption = statusOptions.find(option => option.status_code === newStatus);
      if (!statusOption) {
        throw new Error('Invalid status code');
      }

      // Ensure we have a valid number for bookingId
      let bookingIdNumber: number;
      
      if (typeof booking.id === 'string') {
        bookingIdNumber = parseInt(booking.id);
        if (isNaN(bookingIdNumber)) {
          throw new Error('Invalid booking ID');
        }
      } else if (typeof booking.id === 'number') {
        bookingIdNumber = booking.id;
      } else {
        throw new Error('Booking ID is missing or invalid');
      }

      console.log("Updating status for booking ID:", bookingIdNumber, "to:", newStatus);

      const { error } = await supabase
        .from('BookMST')
        .update({ 
          Status: newStatus,  // Store the status_code
          StatusUpdated: new Date().toISOString()
        })
        .eq('id', bookingIdNumber);

      if (error) {
        console.error("Error updating status in database:", error);
        throw error;
      }

      // Create notification for status change when appropriate
      if (newStatus === 'on_the_way') {
        await createNotification(
          booking, 
          'artist_on_the_way', 
          `Your artist is now on their way to your location. Please be ready for your service.`
        );
      } else if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'controller') {
        await createNotification(
          booking, 
          'status', 
          `Booking status changed to ${statusOption.status_name}`
        );
      }
      
      toast({
        title: "Status Updated",
        description: "The booking status has been successfully updated.",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the service. Please try again.",
      });
      return Promise.reject(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Add handleArtistAssignment to fix the reference error
  const handleArtistAssignment = async (booking: Booking, artistId: string): Promise<void> => {
    try {
      // Convert booking.id to number if it's a string
      const bookingIdNumber = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      // Convert artistId to number if needed for the database
      const artistIdNumber = artistId ? parseInt(artistId) : null;
      
      const { error } = await supabase
        .from('BookMST')
        .update({ 
          ArtistId: artistIdNumber,
          AssignedBY: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin',
          AssingnedON: new Date().toISOString()
        })
        .eq('id', bookingIdNumber);

      if (error) {
        throw error;
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error assigning artist:", error);
      return Promise.reject(error);
    }
  };

  return { 
    statusOptions, 
    fetchStatusOptions, 
    handleStatusChange,
    handleArtistAssignment,
    isUpdatingStatus,
    isLoading
  };
};
