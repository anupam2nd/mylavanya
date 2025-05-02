
import { Card } from "@/components/ui/card";

interface BookingDetailsProps {
  date: string;
  time: string;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ date, time }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">Service Date</p>
        <p className="font-medium">{date}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Service Time</p>
        <p className="font-medium">{time}</p>
      </div>
    </div>
  );
};

export default BookingDetails;
