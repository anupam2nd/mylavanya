
import React, { useState } from "react";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { OTPVerificationDialog } from "@/components/artist/OTPVerificationDialog";
import { useOTPManagement } from "@/hooks/useOTPManagement";
import BookingHeader from "@/components/artist/booking-details/BookingHeader";
import CustomerInfoCard from "@/components/artist/booking-details/CustomerInfoCard";
import ServiceInfoCard from "@/components/artist/booking-details/ServiceInfoCard";
import BookingNotes from "@/components/artist/booking-details/BookingNotes";
import BookingActions from "@/components/artist/booking-details/BookingActions";
import EditServiceDialog from "@/components/artist/EditServiceDialog";
import AddJobDialog from "@/components/artist/AddJobDialog";
import { toast } from "@/components/ui/use-toast";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";

interface ArtistBookingDetailsProps {
  booking: Booking;
  onBack: () => void;
}

const ArtistBookingDetails: React.FC<ArtistBookingDetailsProps> = ({ booking, onBack }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddJobDialog, setShowAddJobDialog] = useState(false);
  const { handleStatusChange } = useBookingStatusManagement();
  
  // Convert booking.id to number for OTPManagement if needed
  const bookingWithNumberId = {
    ...booking,
    // This is only needed if your OTPManagement hook requires a number type for ID
    // Commented out to avoid type mismatch with Booking interface
    // id: typeof booking.id === 'string' ? parseInt(booking.id) : booking.id
  };
  
  const {
    showOtpDialog,
    setShowOtpDialog,
    isConfirming,
    isCompleting,
    sendOTP,
    handleOTPVerified,
    handleCompleteService
  } = useOTPManagement(booking);

  const handleEditService = () => {
    setShowEditDialog(true);
  };

  const handleEditComplete = () => {
    setShowEditDialog(false);
    setIsEditing(false);
  };

  const handleAddNewJob = () => {
    setShowAddJobDialog(true);
  };
  
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
            onEditService={handleEditService}
            onAddNewJob={handleAddNewJob}
            isConfirming={isConfirming}
            isCompleting={isCompleting}
            isEditing={isEditing}
          />
        </CardFooter>
      </Card>
      
      <OTPVerificationDialog 
        isOpen={showOtpDialog} 
        onClose={() => setShowOtpDialog(false)}
        onVerify={handleOTPVerified}
        bookingId={booking.id}
      />

      <EditServiceDialog
        isOpen={showEditDialog}
        onClose={handleEditComplete}
        booking={booking}
      />

      <AddJobDialog
        isOpen={showAddJobDialog}
        onClose={() => setShowAddJobDialog(false)}
        booking={booking}
      />
    </div>
  );
};

export default ArtistBookingDetails;
