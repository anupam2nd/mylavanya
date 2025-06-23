
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface User {
  id: number;
  email_id: string | null;
  FirstName: string | null;
  LastName: string | null;
  role: string | null;
  active?: boolean;
  PhoneNo?: number | null;
}

interface StatusToggleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => void;
}

export const StatusToggleDialog = ({ open, onOpenChange, user, onConfirm }: StatusToggleDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {user?.active ? "Confirm Deactivation" : "Confirm Activation"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {user?.active ? "deactivate" : "activate"} this user? 
            {user?.active 
              ? " Their account will be disabled."
              : " Their account will be enabled."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {user?.active ? "Deactivate" : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
