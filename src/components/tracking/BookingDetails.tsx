
import { Card } from "@/components/ui/card";
import BookingHeader from "./BookingHeader";
import BookingReference from "./BookingReference";
import CustomerDetails from "./CustomerDetails";
import ServicesList from "./ServicesList";
import TotalAmount from "./TotalAmount";

export interface BookingDetailsProps {
  bookingDetails: BookingData[];
}

export interface BookingData {
  Booking_NO: string;
  Purpose: string;
  Phone_no: number;
  Booking_date: string;
  booking_time: string;
  Status: string;
  price: number;
  originalPrice?: number;
  ProductName: string;
  Qty: number;
  Address?: string;
  Pincode?: number;
  name?: string;
  email?: string;
  id?: number;
  Services?: string;
  Subservice?: string;
  Assignedto?: string;
  AssignedBY?: string;
  ArtistId?: number; // Added ArtistId field
}

const BookingDetails = ({ bookingDetails }: BookingDetailsProps) => {
  if (!bookingDetails || bookingDetails.length === 0) return null;

  const firstBooking = bookingDetails[0];
  
  // Calculate total discounted amount
  const totalAmount = bookingDetails.reduce((sum, booking) => 
    sum + (booking.price * (booking.Qty || 1)), 0);
    
  // Calculate total original amount (if available)
  const totalOriginalAmount = bookingDetails.reduce((sum, booking) => 
    sum + ((booking.originalPrice || booking.price) * (booking.Qty || 1)), 0);

  // Only set original amount if different from total
  const displayOriginalAmount = totalOriginalAmount > totalAmount ? totalOriginalAmount : undefined;

  return (
    <div className="mt-8">
      <BookingHeader />
      <div className="bg-gray-50 rounded-lg border p-6">
        <div className="grid grid-cols-2 gap-4">
          <BookingReference reference={firstBooking.Booking_NO} />
          <CustomerDetails booking={firstBooking} />
          <ServicesList services={bookingDetails} />
          <TotalAmount amount={totalAmount} originalAmount={displayOriginalAmount} />
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
