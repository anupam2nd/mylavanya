
import { Card } from "@/components/ui/card";

export interface BookingDetailsProps {
  bookingDetails: BookingData | null;
}

export interface BookingData {
  Booking_NO: string;
  Purpose: string;
  Phone_no: number;
  Booking_date: string;
  booking_time: string;
  Status: string;
  price: number;
  ProductName: string;
  Qty: number;
}

const BookingDetails = ({ bookingDetails }: BookingDetailsProps) => {
  if (!bookingDetails) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Booking Information</h3>
      <div className="bg-gray-50 rounded-lg border p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 bg-primary/10 p-4 rounded-md border border-primary/20 mb-2">
            <p className="text-sm font-medium text-gray-500">Booking Reference</p>
            <p className="text-xl font-bold text-red-600">{bookingDetails.Booking_NO}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Service</p>
            <p className="font-medium">{bookingDetails.ProductName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Purpose</p>
            <p className="font-medium">{bookingDetails.Purpose}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="font-medium">{bookingDetails.Phone_no}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Quantity</p>
            <p className="font-medium">{bookingDetails.Qty || 1}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Unit Price</p>
            <p className="font-medium">₹{bookingDetails.price?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Amount</p>
            <p className="font-medium">₹{((bookingDetails.Qty || 1) * bookingDetails.price)?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Booking Date</p>
            <p className="font-medium">{bookingDetails.Booking_date}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Booking Time</p>
            <p className="font-medium">{bookingDetails.booking_time}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${bookingDetails.Status === 'completed' ? 'bg-green-100 text-green-800' : 
                bookingDetails.Status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'}`}>
              {bookingDetails.Status?.toUpperCase() || 'PENDING'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
