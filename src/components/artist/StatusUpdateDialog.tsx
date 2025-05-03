
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useArtistStatusUpdate, StatusUpdateType } from "@/hooks/useArtistStatusUpdate";
import { Loader2 } from "lucide-react";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  bookingNo: string;
  statusType: StatusUpdateType;
  onStatusUpdated: () => void;
}

const StatusUpdateDialog = ({
  open,
  onOpenChange,
  bookingId,
  bookingNo,
  statusType,
  onStatusUpdated,
}: StatusUpdateDialogProps) => {
  const [otp, setOtp] = useState("");
  const {
    loading,
    otpSent,
    verifyingOtp,
    initiateOtpFlow,
    verifyOtpAndUpdateStatus,
    cancelOtpFlow
  } = useArtistStatusUpdate();

  const handleClose = () => {
    if (otpSent) {
      cancelOtpFlow();
    }
    setOtp("");
    onOpenChange(false);
  };

  const handleInitiateOtp = async () => {
    const success = await initiateOtpFlow(bookingId, statusType);
    if (!success) {
      handleClose();
    }
  };

  const handleVerifyOtp = async () => {
    const success = await verifyOtpAndUpdateStatus(otp);
    if (success) {
      onStatusUpdated();
      handleClose();
    }
  };

  const getStatusTitle = () => {
    switch (statusType) {
      case "start":
        return "Start Service";
      case "complete":
        return "Complete Service";
      default:
        return "Update Status";
    }
  };

  const getStatusDescription = () => {
    switch (statusType) {
      case "start":
        return "You're about to mark this service as started.";
      case "complete":
        return "You're about to mark this service as completed.";
      default:
        return "Update the status of this booking.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getStatusTitle()}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {getStatusDescription()} Booking #{bookingNo}
          </p>
        </DialogHeader>

        {!otpSent ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p>
                To update the status to <strong>{statusType === "start" ? "Started" : "Completed"}</strong>,
                you need to verify with an OTP that will be sent to the customer.
              </p>
              <p className="text-sm text-muted-foreground">
                Please make sure you're with the customer to receive the OTP.
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleInitiateOtp} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Ask the customer for the OTP sent to their phone.
              </p>
            </div>
            <DialogFooter className="sm:justify-end">
              <Button variant="outline" onClick={handleClose} disabled={verifyingOtp}>
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOtp}
                disabled={!otp || otp.length < 6 || verifyingOtp}
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Update"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateDialog;
