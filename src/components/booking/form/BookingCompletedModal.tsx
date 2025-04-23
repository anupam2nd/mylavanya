
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface BookingCompletedModalProps {
  bookingRef: string;
  onCancel?: () => void;
}

const BookingCompletedModal = ({ bookingRef, onCancel }: BookingCompletedModalProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-2xl text-center animate-fade-in">
        <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold mb-6">Booking Confirmed!</h2>
        <div className="mb-4 bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Booking Reference</h3>
          <p className="text-5xl font-extrabold text-red-600 mb-4">{bookingRef}</p>
          <p className="text-gray-700">
            Please save this reference number for future inquiries.
          </p>
        </div>
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertTitle className="text-lg font-bold">Payment Required</AlertTitle>
          <AlertDescription>
            Your booking is not confirmed until payment is made. Please contact our support team for payment options.
          </AlertDescription>
        </Alert>
        <Button onClick={onCancel} className="w-full text-lg py-6" size="lg">
          Done
        </Button>
      </div>
    </div>
  );
};

export default BookingCompletedModal;
