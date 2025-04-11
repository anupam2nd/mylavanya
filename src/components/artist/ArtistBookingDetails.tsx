import React, { useState } from "react";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Clock, Phone, MapPin, Calendar, Info } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { OTPVerificationDialog } from "@/components/artist/OTPVerificationDialog";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ArtistBookingDetailsProps {
  booking: Booking;
  onBack: () => void;
}

const ArtistBookingDetails: React.FC<ArtistBookingDetailsProps> = ({ booking, onBack }) => {
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
          p_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
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
  
  // Determine if actions should be enabled based on booking status
  const canConfirm = booking.Status === "approve" || booking.Status === "pending";
  const canComplete = booking.Status === "confirm" || booking.Status === "service_started" || booking.Status === "ontheway";

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bookings
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Booking #{booking.Booking_NO}</CardTitle>
            <StatusBadge status={booking.Status || 'pending'} />
          </div>
          <p className="text-sm text-muted-foreground">Job #{booking.jobno || 'N/A'}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Customer Details</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{booking.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{booking.Phone_no}</p>
                </div>
                {booking.Address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <p className="text-sm">{booking.Address} {booking.Pincode && `- ${booking.Pincode}`}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Service Details</h3>
              <div className="space-y-2">
                <p className="font-medium">{booking.ServiceName} {booking.SubService && `- ${booking.SubService}`}</p>
                {booking.ProductName && (
                  <p className="text-sm">{booking.ProductName} x {booking.Qty || 1}</p>
                )}
                <p className="text-sm">Price: ₹{booking.price}</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{booking.Booking_date}</p>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{booking.booking_time}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{booking.Purpose || 'No additional notes'}</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
          {canConfirm && (
            <Button 
              onClick={sendOTP} 
              disabled={isConfirming}
              className="w-full sm:w-auto"
            >
              {isConfirming ? "Sending OTP..." : "Confirm Service"}
            </Button>
          )}
          
          {canComplete && (
            <Button 
              onClick={handleCompleteService} 
              disabled={isCompleting}
              className="w-full sm:w-auto"
              variant="default"
            >
              <Check className="h-4 w-4 mr-2" />
              {isCompleting ? "Updating..." : "Mark Service as Complete"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <OTPVerificationDialog 
        isOpen={showOtpDialog} 
        onClose={() => setShowOtpDialog(false)}
        onVerify={handleOTPVerified}
        bookingId={booking.id}
      />
    </div>
  );
};

export default ArtistBookingDetails;
