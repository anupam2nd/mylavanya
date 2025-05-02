
import { BookOpen } from "lucide-react";

const BookingHeader = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold flex items-center">
        <BookOpen size={20} className="text-primary mr-2" />
        Booking Information
      </h3>
    </div>
  );
};

export default BookingHeader;
