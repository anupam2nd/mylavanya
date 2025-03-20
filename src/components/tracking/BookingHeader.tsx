
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface BookingHeaderProps {
  onPrint: () => void;
}

const BookingHeader = ({ onPrint }: BookingHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">Booking Information</h3>
      <Button
        variant="outline"
        size="sm"
        onClick={onPrint}
        className="flex items-center gap-2"
      >
        <Printer size={16} />
        Print Booking
      </Button>
    </div>
  );
};

export default BookingHeader;
