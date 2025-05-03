
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useArtistStatusUpdate } from "@/hooks/useArtistStatusUpdate";
import { Loader2, MapPin } from "lucide-react";

interface DirectStatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  bookingNo: string;
  onStatusUpdated: () => void;
}

const DirectStatusUpdateDialog = ({
  open,
  onOpenChange,
  bookingId,
  bookingNo,
  onStatusUpdated,
}: DirectStatusUpdateDialogProps) => {
  const { loading, updateStatusDirect } = useArtistStatusUpdate();

  const handleConfirm = async () => {
    const success = await updateStatusDirect(bookingId);
    if (success) {
      onStatusUpdated();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Status to "On The Way"</DialogTitle>
          <p className="text-sm text-muted-foreground">
            You're about to mark that you're on the way to the customer.
            Booking #{bookingNo}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <p>
                This will update the booking status to "On The Way" and notify the customer
                that you're traveling to their location to provide the service.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectStatusUpdateDialog;
