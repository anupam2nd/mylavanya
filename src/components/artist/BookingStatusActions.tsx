
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Play, CheckCircle } from "lucide-react";
import StatusUpdateDialog from "./StatusUpdateDialog";
import DirectStatusUpdateDialog from "./DirectStatusUpdateDialog";
import { StatusUpdateType } from "@/hooks/useArtistStatusUpdate";
import { supabase } from "@/integrations/supabase/client";

interface BookingStatusActionsProps {
  bookingId: number;
  bookingNo: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

interface StatusCode {
  status_code: string;
  status_name: string;
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
  const [statusCodes, setStatusCodes] = useState<Record<string, string>>({});
  const [statusNames, setStatusNames] = useState<Record<string, string>>({});

  // Fetch status codes from the database
  useEffect(() => {
    const fetchStatusCodes = async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name');
        
        if (error) throw error;
        
        if (data) {
          const codeMap: Record<string, string> = {};
          const nameMap: Record<string, string> = {};
          data.forEach(status => {
            codeMap[status.status_name.toLowerCase()] = status.status_code;
            nameMap[status.status_code.toLowerCase()] = status.status_name;
          });
          setStatusCodes(codeMap);
          setStatusNames(nameMap);
          console.log("Status mappings loaded:", { codeMap, nameMap });
        }
      } catch (error) {
        console.error('Error fetching status codes:', error);
      }
    };
    
    fetchStatusCodes();
  }, []);

  const handleStartOtpFlow = (type: StatusUpdateType) => {
    setStatusType(type);
    setShowStatusDialog(true);
  };

  const normalizedStatus = currentStatus.toLowerCase();
  
  // Helper function to check if status matches any of the given values
  const statusMatches = (statusValues: string[]): boolean => {
    const currentStatusLower = currentStatus.toLowerCase();
    
    // Direct match on status name or code
    if (statusValues.some(val => currentStatusLower.includes(val))) {
      return true;
    }
    
    // Check if the current status is a code that maps to any of the status names
    const mappedStatusName = statusNames[currentStatusLower];
    if (mappedStatusName && statusValues.some(val => mappedStatusName.toLowerCase().includes(val))) {
      return true;
    }
    
    // Check if the current status is a name that maps to any of the status codes
    const mappedStatusCode = statusCodes[currentStatusLower];
    if (mappedStatusCode && statusValues.some(val => mappedStatusCode.toLowerCase().includes(val))) {
      return true;
    }
    
    return false;
  };
  
  // Determine which buttons to show based on current status
  const showOnTheWayButton = statusMatches([
    "confirmed", "beautician_assigned", "assigned", 
    "beautician assigned", "confirmed"
  ]);
  
  const showStartButton = statusMatches([
    "on the way", "ontheway", "on_the_way"
  ]);
  
  const showCompleteButton = statusMatches([
    "service_started", "start", "started", "service started"
  ]);

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
