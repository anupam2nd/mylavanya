
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, SendHorizonal, Edit } from "lucide-react";
import { Booking } from "@/hooks/useBookings";

interface BookingActionsProps {
  booking: Booking;
  onSendOTP: () => void;
  onCompleteService: () => void;
  onEditService: () => void;
  isConfirming: boolean;
  isCompleting: boolean;
  isEditing: boolean;
}

const BookingActions: React.FC<BookingActionsProps> = ({ 
  booking, 
  onSendOTP, 
  onCompleteService,
  onEditService,
  isConfirming,
  isCompleting,
  isEditing
}) => {
  // Determine if actions should be enabled based on booking status
  const canSendOTP = booking.Status === "Beautician_assigned" || booking.Status === "approve" || booking.Status === "pending";
  const canComplete = booking.Status === "confirm" || booking.Status === "service_started" || booking.Status === "ontheway";
  const canEdit = booking.Status !== "done" && booking.Status !== "cancelled";

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      {canSendOTP && (
        <Button 
          onClick={onSendOTP} 
          disabled={isConfirming}
          className="w-full sm:w-auto"
          variant="outline"
        >
          <SendHorizonal className="h-4 w-4 mr-2" />
          {isConfirming ? "Sending OTP..." : "Send OTP to Customer"}
        </Button>
      )}
      
      {canEdit && (
        <Button 
          onClick={onEditService} 
          disabled={isEditing}
          className="w-full sm:w-auto"
          variant="secondary"
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Processing..." : "Edit Service"}
        </Button>
      )}
      
      {canComplete && (
        <Button 
          onClick={onCompleteService} 
          disabled={isCompleting}
          className="w-full sm:w-auto"
          variant="default"
        >
          <Check className="h-4 w-4 mr-2" />
          {isCompleting ? "Updating..." : "Mark Service as Complete"}
        </Button>
      )}
    </div>
  );
};

export default BookingActions;
