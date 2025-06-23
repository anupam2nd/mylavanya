
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type StatusUpdateType = "on_the_way" | "start" | "complete";

export const useArtistStatusUpdate = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState<number | null>(null);
  const [statusTypeInProgress, setStatusTypeInProgress] = useState<StatusUpdateType | null>(null);

  // Function to update status without OTP (for "on the way" status)
  const updateStatusDirect = async (bookingId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to update booking status",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    setBookingInProgress(bookingId);

    try {
      // Get user details from UserMST (if available)
      const { data: userData } = await supabase
        .from("UserMST")
        .select("email_id, FirstName, LastName, role")
        .eq("email_id", user.email)
        .maybeSingle();

      // Prepare update data
      const now = new Date();
      const updates = {
        Status: "On The Way",
        StatusUpdated: now.toISOString(),
        AssignedBY: (userData?.role || user?.role || "artist"),
        AssignedByUser: userData?.email_id || user?.email
      };

      const { error } = await supabase
        .from("BookMST")
        .update(updates)
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Booking status has been updated to On The Way",
      });

      return true;
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error updating status",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
      setBookingInProgress(null);
    }
  };

  // Function to initiate OTP verification flow
  const initiateOtpFlow = async (bookingId: number, statusType: StatusUpdateType) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to update booking status",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    setBookingInProgress(bookingId);
    setStatusTypeInProgress(statusType);

    try {
      // Send OTP request to edge function
      const { data, error } = await supabase.functions.invoke("send-service-otp", {
        body: {
          bookingId,
          statusType
        }
      });

      if (error) throw error;

      console.log("OTP response:", data);

      setOtpSent(true);
      
      toast({
        title: "OTP sent",
        description: `An OTP has been sent to the customer's phone number. Please ask them to share it with you.`,
      });

      return true;
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error sending OTP",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to verify OTP and complete status update
  const verifyOtpAndUpdateStatus = async (otp: string) => {
    if (!bookingInProgress || !statusTypeInProgress) {
      toast({
        title: "Error",
        description: "No active booking status update in progress",
        variant: "destructive",
      });
      return false;
    }

    setVerifyingOtp(true);

    try {
      // Get user details from UserMST (if available)
      const { data: userData } = await supabase
        .from("UserMST")
        .select("email_id, FirstName, LastName, role")
        .eq("email_id", user?.email)
        .maybeSingle();

      const currentUser = {
        email_id: userData?.email_id || user?.email,
        FirstName: userData?.FirstName || "",
        LastName: userData?.LastName || "",
        role: userData?.role || user?.role || "artist"
      };

      // Send verification request to edge function
      const { data, error } = await supabase.functions.invoke("verify-service-otp", {
        body: {
          bookingId: bookingInProgress,
          otp,
          statusType: statusTypeInProgress,
          currentUser
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "OTP verification failed");
      }

      toast({
        title: "Status updated",
        description: `Booking status has been updated to ${data.newStatus}`,
      });

      // Reset states
      setOtpSent(false);
      setBookingInProgress(null);
      setStatusTypeInProgress(null);

      return true;
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error verifying OTP",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
      return false;
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Function to cancel OTP flow
  const cancelOtpFlow = () => {
    setOtpSent(false);
    setBookingInProgress(null);
    setStatusTypeInProgress(null);
  };

  return {
    loading,
    otpSent,
    verifyingOtp,
    bookingInProgress,
    statusTypeInProgress,
    updateStatusDirect,
    initiateOtpFlow,
    verifyOtpAndUpdateStatus,
    cancelOtpFlow
  };
};
