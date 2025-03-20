
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useRef } from "react";

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
  const printRef = useRef<HTMLDivElement>(null);

  if (!bookingDetails) return null;

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
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .detail-item { margin-bottom: 8px; }
        .detail-label { font-size: 14px; color: #666; margin-bottom: 4px; }
        .detail-value { font-weight: bold; }
        .status { display: inline-block; padding: 5px 12px; border-radius: 20px; font-weight: bold; }
        .status-completed { background-color: #dcfce7; color: #166534; }
        .status-pending { background-color: #fef9c3; color: #854d0e; }
        .status-cancelled { background-color: #fee2e2; color: #b91c1c; }
        .status-processing { background-color: #dbeafe; color: #1e40af; }
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
          <div class="booking-ref">Booking #${bookingDetails.Booking_NO}</div>
        </div>
        <h2 class="print-title">Booking Details</h2>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">Service</div>
            <div class="detail-value">${bookingDetails.ProductName}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Purpose</div>
            <div class="detail-value">${bookingDetails.Purpose}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Phone</div>
            <div class="detail-value">${bookingDetails.Phone_no}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Quantity</div>
            <div class="detail-value">${bookingDetails.Qty || 1}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Unit Price</div>
            <div class="detail-value">₹${bookingDetails.price?.toFixed(2) || '0.00'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Total Amount</div>
            <div class="detail-value">₹${((bookingDetails.Qty || 1) * bookingDetails.price)?.toFixed(2) || '0.00'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Booking Date</div>
            <div class="detail-value">${bookingDetails.Booking_date}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Booking Time</div>
            <div class="detail-value">${bookingDetails.booking_time}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">
              <span class="status ${getStatusClass(bookingDetails.Status)}">${bookingDetails.Status?.toUpperCase() || 'PENDING'}</span>
            </div>
          </div>
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
            <StatusBadge status={bookingDetails.Status || 'pending'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
