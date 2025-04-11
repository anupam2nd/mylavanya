
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { OTPVerificationDialog } from "@/components/artist/OTPVerificationDialog";
import { useOTPManagement } from "@/hooks/useOTPManagement";
import BookingHeader from "@/components/artist/booking-details/BookingHeader";
import CustomerInfoCard from "@/components/artist/booking-details/CustomerInfoCard";
import ServiceInfoCard from "@/components/artist/booking-details/ServiceInfoCard";
import BookingNotes from "@/components/artist/booking-details/BookingNotes";
import BookingActions from "@/components/artist/booking-details/BookingActions";

interface ArtistBookingDetailsProps {
  booking: Booking;
  onBack: () => void;
}

const ArtistBookingDetails: React.FC<ArtistBookingDetailsProps> = ({ booking, onBack }) => {
  const {
    showOtpDialog,
    setShowOtpDialog,
    isConfirming,
    isCompleting,
    sendOTP,
    handleOTPVerified,
    handleCompleteService
  } = useOTPManagement(booking);

  return (
    <div className="space-y-4">
      <BookingHeader booking={booking} onBack={onBack} />
      
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <CustomerInfoCard booking={booking} />
            <ServiceInfoCard booking={booking} />
          </div>
          
          <BookingNotes booking={booking} />
        </CardContent>
        
        <CardFooter>
          <BookingActions 
            booking={booking}
            onSendOTP={sendOTP}
            onCompleteService={handleCompleteService}
            isConfirming={isConfirming}
            isCompleting={isCompleting}
          />
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
