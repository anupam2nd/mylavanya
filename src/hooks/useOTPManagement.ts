
import { useState } from "react";
import { Booking } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useOTPManagement = (booking: Booking) => {
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  const handleOTPVerified = async () => {
    // Handle OTP verification logic
    setShowOtpDialog(false);
    toast({
      title: "OTP verified",
      description: "Service status has been updated",
    });
  };

  const handleCompleteService = async () => {
    setIsCompleting(true);
    try {
      // Complete service logic - direct without OTP
      const bookingId = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .update({ "Status": 'done' }) // Use proper case with quotes for column name
        .eq('id', bookingId);
      
      if (error) throw error;
      
      toast({
        title: "Service completed",
        description: "The service has been marked as complete",
      });
    } catch (error) {
      console.error("Error completing service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not complete the service. Please try again.",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    showOtpDialog,
    setShowOtpDialog,
    isConfirming,
    isCompleting,
    handleOTPVerified,
    handleCompleteService
  };
};
