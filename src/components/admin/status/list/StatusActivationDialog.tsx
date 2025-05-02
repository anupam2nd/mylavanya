
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusOption } from "@/hooks/useStatusOptions";

interface StatusActivationDialogProps {
  status: StatusOption | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const StatusActivationDialog = ({ 
  status, 
  isOpen, 
  onClose, 
  onConfirm 
}: StatusActivationDialogProps) => {
  if (!status) return null;
  
  const actionType = status.active ? "deactivate" : "activate";
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status.active ? "Confirm Deactivate" : "Confirm Activate"}
          </DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to {actionType} the status "{status.status_name}"?
        </p>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm}
          >
            {status.active ? "Deactivate" : "Activate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusActivationDialog;
