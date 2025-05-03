
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Play, CheckCircle } from "lucide-react";
import StatusUpdateDialog from "./StatusUpdateDialog";
import DirectStatusUpdateDialog from "./DirectStatusUpdateDialog";
import { StatusUpdateType } from "@/hooks/useArtistStatusUpdate";

interface BookingStatusActionsProps {
  bookingId: number;
  bookingNo: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

const BookingStatusActions = ({
  bookingId,
  bookingNo,
  currentStatus,
  onStatusUpdated,
}: BookingStatusActionsProps) => {
  const [showDirectDialog, setShowDirectDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusType, setStatusType] = useState<StatusUpdateType>("start");

  const handleStartOtpFlow = (type: StatusUpdateType) => {
    setStatusType(type);
    setShowStatusDialog(true);
  };

  const normalizedStatus = currentStatus.toLowerCase();
  
  // Determine which buttons to show based on current status
  const showOnTheWayButton = ["confirmed", "beautician_assigned", "assigned"].some(
    status => normalizedStatus.includes(status)
  );
  
  const showStartButton = normalizedStatus.includes("on the way") || 
                          normalizedStatus.includes("ontheway");
  
  const showCompleteButton = normalizedStatus.includes("service_started") || 
                             normalizedStatus.includes("start");

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {showOnTheWayButton && (
          <Button
            size="sm"
            className="flex items-center gap-1"
            variant="outline"
            onClick={() => setShowDirectDialog(true)}
          >
            <MapPin className="h-3.5 w-3.5" />
            On The Way
          </Button>
        )}
        
        {showStartButton && (
          <Button
            size="sm"
            className="flex items-center gap-1"
            variant="outline"
            onClick={() => handleStartOtpFlow("start")}
          >
            <Play className="h-3.5 w-3.5" />
            Start Service
          </Button>
        )}
        
        {showCompleteButton && (
          <Button
            size="sm"
            className="flex items-center gap-1"
            variant="outline"
            onClick={() => handleStartOtpFlow("complete")}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Complete
          </Button>
        )}
      </div>

      <DirectStatusUpdateDialog
        open={showDirectDialog}
        onOpenChange={setShowDirectDialog}
        bookingId={bookingId}
        bookingNo={bookingNo}
        onStatusUpdated={onStatusUpdated}
      />

      <StatusUpdateDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        bookingId={bookingId}
        bookingNo={bookingNo}
        statusType={statusType}
        onStatusUpdated={onStatusUpdated}
      />
    </>
  );
};

export default BookingStatusActions;
