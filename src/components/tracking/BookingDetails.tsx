import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Booking } from '@/hooks/useBookings';

// Export the type for reuse
export type BookingData = Booking;

interface BookingDetailsProps {
  bookingDetails: BookingData[];
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ bookingDetails }) => {
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
    <div className="mt-6">
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
