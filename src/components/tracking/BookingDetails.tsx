
import { Card } from "@/components/ui/card";

export interface BookingData {
  Booking_NO: string;
  Purpose?: string;
  Phone_no?: number;
  Booking_date: string;
  booking_time: string;
  Status?: string;
  price?: number;
  ProductName?: string;
  Qty?: number;
  name?: string;
  email?: string;
  Address?: string;
  Pincode?: number;
  ArtistId?: number;
}

export interface BookingDetailsProps {
  date: string;
  time: string;
  bookingDetails?: BookingData[];
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ date, time, bookingDetails }) => {
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
