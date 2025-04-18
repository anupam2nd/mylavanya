
import { Loader2, CreditCard } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ButtonCustom } from "@/components/ui/button-custom";

interface TotalsSummaryProps {
  selectedCount: number;
  total: number;
  isProcessing: boolean;
  onPayment: () => void;
  onBackToBookings: () => void;
}

export const TotalsSummary = ({
  selectedCount,
  total,
  isProcessing,
  onPayment,
  onBackToBookings
}: TotalsSummaryProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Selected Bookings</span>
            <span>{selectedCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>₹0.00</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <ButtonCustom
          className="w-full"
          variant="primary-gradient"
          size="lg"
          disabled={selectedCount === 0 || isProcessing}
          onClick={onPayment}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Make Payment (₹{total.toFixed(2)})
            </>
          )}
        </ButtonCustom>
        <Button
          variant="outline"
          className="w-full"
          onClick={onBackToBookings}
        >
          Back to Bookings
        </Button>
      </CardFooter>
    </Card>
  );
};
