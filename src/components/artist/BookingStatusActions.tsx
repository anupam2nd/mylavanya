
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useArtistStatusUpdate } from "@/hooks/useArtistStatusUpdate";
import StatusUpdateDialog from "./StatusUpdateDialog";
import { Loader2 } from "lucide-react";

interface BookingStatusActionsProps {
  booking: any;
  onStatusUpdated: () => void;
}

const BookingStatusActions = ({ booking, onStatusUpdated }: BookingStatusActionsProps) => {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const { updateStatusDirect, loading, bookingInProgress } = useArtistStatusUpdate();

  const currentStatus = booking.Status?.toLowerCase() || "";
  
  // Determine what button to show based on current status
  const getStatusAction = () => {
    switch (currentStatus) {
      case "pending":
      case "assigned":
        return {
          label: "On The Way",
          action: "direct",
          variant: "default" as const
        };
      case "on the way":
        return {
          label: "Start Service",
          action: "otp",
          variant: "default" as const
        };
      case "service started":
      case "service_started":
        return {
          label: "Complete Service",
          action: "otp",
          variant: "default" as const
        };
      case "completed":
      case "complete":
      case "done":
        return null; // No action button for completed services
      default:
        return {
          label: "On The Way",
          action: "direct",
          variant: "default" as const
        };
    }
  };

  const handleDirectStatusUpdate = async () => {
    const success = await updateStatusDirect(booking.id);
    if (success) {
      onStatusUpdated();
    }
  };

  const handleOtpStatusUpdate = () => {
    setIsStatusDialogOpen(true);
  };

  const statusAction = getStatusAction();

  if (!statusAction) {
    return null; // No button for completed services
  }

  const isCurrentBookingLoading = loading && bookingInProgress === booking.id;

  return (
    <>
      <Button
        variant={statusAction.variant}
        size="sm"
        onClick={statusAction.action === "direct" ? handleDirectStatusUpdate : handleOtpStatusUpdate}
        disabled={isCurrentBookingLoading}
        className="text-xs h-7"
      >
        {isCurrentBookingLoading ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Updating...
          </>
        ) : (
          statusAction.label
        )}
      </Button>

      {statusAction.action === "otp" && (
        <StatusUpdateDialog
          open={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          booking={booking}
          onStatusUpdated={onStatusUpdated}
        />
      )}
    </>
  );
};

export default BookingStatusActions;
