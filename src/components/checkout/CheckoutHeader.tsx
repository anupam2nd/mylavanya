
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface CheckoutHeaderProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const CheckoutHeader = ({ selectedCount, onSelectAll, onDeselectAll }: CheckoutHeaderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Your Pending Bookings</h2>
        <div className="space-x-2">
          {selectedCount > 0 ? (
            <Button variant="outline" size="sm" onClick={onDeselectAll}>
              Deselect All
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Select All
            </Button>
          )}
        </div>
      </div>
      
      <Alert variant="default">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Payment is required to confirm your bookings. Your appointment time will be reserved once payment is completed.
        </AlertDescription>
      </Alert>
    </div>
  );
};
