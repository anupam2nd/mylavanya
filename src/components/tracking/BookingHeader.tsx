
import { BookOpen } from "lucide-react";

interface BookingHeaderProps {
  bookingNo: string;
  status: string;
}

const BookingHeader: React.FC<BookingHeaderProps> = ({ bookingNo, status }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold flex items-center">
        <BookOpen size={20} className="text-primary mr-2" />
        Booking Information
        <span className="ml-2 text-sm text-muted-foreground">#{bookingNo}</span>
      </h3>
      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
        {status}
      </div>
    </div>
  );
};

export default BookingHeader;
