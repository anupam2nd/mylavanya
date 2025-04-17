
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

export const useBookingStatusManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statusOptions, setStatusOptions] = useState<{status_code: string; status_name: string}[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchStatusOptions();
  }, []);

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
      
      // Convert booking.id to number if it's a string
      const bookingIdNumber = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;

      const { error } = await supabase
        .from('BookMST')
        .update({ 
          Status: newStatus,
          StatusUpdated: new Date().toISOString()
        })
        .eq('id', bookingIdNumber);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to update status",
          description: error.message,
        });
        return Promise.reject(error);
      }

      if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'controller') {
        await createNotification(booking, 'status', `Booking status changed to ${newStatus}`);
      }

      toast({
        title: "Status updated",
        description: `Booking status changed to ${newStatus}`,
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: "An unexpected error occurred",
      });
      return Promise.reject(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return { 
    statusOptions, 
    fetchStatusOptions, 
    handleStatusChange,
    isUpdatingStatus
  };
};
