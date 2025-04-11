
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Booking } from "@/hooks/useBookings";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";

export const useOTPManagement = (booking: Booking) => {
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { handleStatusChange } = useBookingStatusManagement();

  const sendOTP = async () => {
    try {
      setIsConfirming(true);
      
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Using a raw query with PostgreSQL function to bypass TypeScript definition limitations
      const { error } = await supabase.rpc(
        'insert_booking_otp' as any, 
        {
          p_booking_id: booking.id,
          p_otp: otp,
          p_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // Extended to 15 minutes
        }
      );
        
      if (error) throw error;
      
      // Send OTP to user's phone (mock for now)
      console.log(`Sending OTP ${otp} to ${booking.Phone_no}`);
      
      // In a real implementation, you would integrate with SMS API here
      // For now, we'll just show the OTP in a toast for demo purposes
      toast({
        title: "OTP Generated",
        description: `OTP: ${otp} (would be sent to customer's phone in production)`,
      });
      
      // Show OTP verification dialog
      setShowOtpDialog(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: "There was an error sending the OTP. Please try again."
      });
    } finally {
      setIsConfirming(false);
    }
  };
  
  const handleOTPVerified = async () => {
    setShowOtpDialog(false);
    
    try {
      // Update booking status to confirm after OTP verification
      await handleStatusChange(booking, "confirm");
      
      toast({
        title: "Service Confirmed",
        description: "The service has been confirmed successfully.",
      });
    } catch (error) {
      console.error("Error confirming service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking status."
      });
    }
  };
  
  const handleCompleteService = async () => {
    try {
      setIsCompleting(true);
      
      // Update booking status to done
      await handleStatusChange(booking, "done");
      
      toast({
        title: "Service Completed",
        description: "The service has been marked as completed successfully.",
      });
    } catch (error) {
      console.error("Error completing service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking status."
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
    sendOTP,
    handleOTPVerified,
    handleCompleteService
  };
};
