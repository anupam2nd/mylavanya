
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, PlusCircle } from "lucide-react";
import { Booking } from "@/hooks/useBookings";

interface BookingActionsProps {
  booking: Booking;
  onCompleteService: () => void;
  onEditService: () => void;
  onAddNewJob?: () => void;
  isCompleting: boolean;
  isEditing: boolean;
}

const BookingActions: React.FC<BookingActionsProps> = ({ 
  booking, 
  onCompleteService,
  onEditService,
  onAddNewJob,
  isCompleting,
  isEditing
}) => {
  const canComplete = booking.Status === "confirm" || booking.Status === "service_started" || booking.Status === "ontheway";
  const canEdit = booking.Status !== "done" && booking.Status !== "cancelled";
  const canAddNewJob = booking.Status !== "done" && booking.Status !== "cancelled";

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 pt-2 flex-wrap">
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
        
        {canEdit && (
          <Button 
            onClick={onEditService} 
            disabled={isEditing}
            className="w-full sm:w-auto"
            variant="secondary"
          >
            <Check className="h-4 w-4 mr-2" />
            {isEditing ? "Processing..." : "Update Status"}
          </Button>
        )}

        {canAddNewJob && onAddNewJob && (
          <Button 
            onClick={onAddNewJob} 
            className="w-full sm:w-auto"
            variant="outline"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Job
          </Button>
        )}
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground text-center">
        If you are unable to provide the service please contact the concerned person
      </div>
    </>
  );
};

export default BookingActions;
