
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useRef } from "react";

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
  ProductName: string;
  Qty: number;
  Address?: string;
  Pincode?: number;
  name?: string;
}

const BookingDetails = ({ bookingDetails }: BookingDetailsProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!bookingDetails || bookingDetails.length === 0) return null;

  // All bookings have the same reference, date, phone, etc. - just different services
  const firstBooking = bookingDetails[0];
  
  // Calculate total price for all services
  const totalAmount = bookingDetails.reduce((sum, booking) => 
    sum + (booking.price * (booking.Qty || 1)), 0);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    const printStyles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .print-header { text-align: center; margin-bottom: 30px; }
        .booking-ref { font-size: 24px; font-weight: bold; color: #e11d48; margin-bottom: 8px; }
        .print-title { font-size: 22px; margin-bottom: 20px; }
        .services-list { margin-bottom: 20px; }
        .service-item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .service-name { font-weight: bold; }
        .service-details { color: #666; font-size: 14px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .detail-item { margin-bottom: 8px; }
        .detail-label { font-size: 14px; color: #666; margin-bottom: 4px; }
        .detail-value { font-weight: bold; }
        .status { display: inline-block; padding: 5px 12px; border-radius: 20px; font-weight: bold; }
        .status-completed { background-color: #dcfce7; color: #166534; }
        .status-pending { background-color: #fef9c3; color: #854d0e; }
        .status-cancelled { background-color: #fee2e2; color: #b91c1c; }
        .status-processing { background-color: #dbeafe; color: #1e40af; }
        .total-section { margin-top: 20px; text-align: right; font-size: 18px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    `;

    // Get status class based on booking status
    const getStatusClass = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'pending': return 'status-pending';
        case 'cancelled': return 'status-cancelled';
        case 'processing': return 'status-processing';
        default: return 'status-pending';
      }
    };

    // Create print-specific HTML
    const printHTML = `
      ${printStyles}
      <div class="print-container">
        <div class="print-header">
          <div class="booking-ref">Booking #${firstBooking.Booking_NO}</div>
        </div>
        <h2 class="print-title">Booking Details</h2>
        <div class="detail-grid">
          ${firstBooking.name ? `
          <div class="detail-item">
            <div class="detail-label">Name</div>
            <div class="detail-value">${firstBooking.name}</div>
          </div>
          ` : ''}
          <div class="detail-item">
            <div class="detail-label">Phone</div>
            <div class="detail-value">${firstBooking.Phone_no}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Booking Date</div>
            <div class="detail-value">${firstBooking.Booking_date}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Booking Time</div>
            <div class="detail-value">${firstBooking.booking_time}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">
              <span class="status ${getStatusClass(firstBooking.Status)}">${firstBooking.Status?.toUpperCase() || 'PENDING'}</span>
            </div>
          </div>
          ${firstBooking.Address ? `
          <div class="detail-item">
            <div class="detail-label">Address</div>
            <div class="detail-value">${firstBooking.Address}</div>
          </div>
          ` : ''}
          ${firstBooking.Pincode ? `
          <div class="detail-item">
            <div class="detail-label">Pincode</div>
            <div class="detail-value">${firstBooking.Pincode}</div>
          </div>
          ` : ''}
        </div>
        
        <h3>Services</h3>
        <div class="services-list">
          ${bookingDetails.map((booking) => `
            <div class="service-item">
              <div class="service-name">${booking.ProductName}</div>
              <div class="service-details">
                Quantity: ${booking.Qty || 1} × ₹${booking.price?.toFixed(2) || '0.00'} = 
                ₹${((booking.Qty || 1) * booking.price)?.toFixed(2) || '0.00'}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="total-section">
          <strong>Total Amount: ₹${totalAmount.toFixed(2)}</strong>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing our service. For any questions, please contact customer support.</p>
        </div>
      </div>
    `;

    // Replace the document content with our print-specific HTML
    document.body.innerHTML = printHTML;
    
    // Trigger the print dialog
    window.print();
    
    // Restore the original document content
    document.body.innerHTML = originalContents;
  };

  return (
    <div className="mt-8" ref={printRef}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Booking Information</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer size={16} />
          Print Booking
        </Button>
      </div>
      <div className="bg-gray-50 rounded-lg border p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 bg-primary/10 p-4 rounded-md border border-primary/20 mb-2">
            <p className="text-sm font-medium text-gray-500">Booking Reference</p>
            <p className="text-xl font-bold text-red-600">{firstBooking.Booking_NO}</p>
          </div>
          
          {firstBooking.name && (
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="font-medium">{firstBooking.name}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="font-medium">{firstBooking.Phone_no}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <StatusBadge status={firstBooking.Status || 'pending'} />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Booking Date</p>
            <p className="font-medium">{firstBooking.Booking_date}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Booking Time</p>
            <p className="font-medium">{firstBooking.booking_time}</p>
          </div>
          
          {firstBooking.Address && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="font-medium">{firstBooking.Address}</p>
            </div>
          )}
          
          {firstBooking.Pincode && (
            <div>
              <p className="text-sm font-medium text-gray-500">Pincode</p>
              <p className="font-medium">{firstBooking.Pincode}</p>
            </div>
          )}
          
          <div className="col-span-2 mt-4 border-t pt-4">
            <p className="text-sm font-medium text-gray-500 mb-3">Services</p>
            <div className="space-y-3">
              {bookingDetails.map((booking, index) => (
                <div key={index} className="bg-white p-3 rounded-md border">
                  <p className="font-medium">{booking.ProductName}</p>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <p>Quantity: {booking.Qty || 1}</p>
                    <p>Price: ₹{booking.price?.toFixed(2) || '0.00'}</p>
                    <p>Total: ₹{((booking.Qty || 1) * booking.price)?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-span-2 mt-4 flex justify-end">
            <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-xl font-bold">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
