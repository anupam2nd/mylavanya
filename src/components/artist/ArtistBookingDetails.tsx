
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PenSquare } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Booking } from "@/hooks/useBookings";
import EditServiceDialog from "./EditServiceDialog";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";

interface ArtistBookingDetailsProps {
  booking: Booking;
  onBack: () => void;
  onAddNewJob?: (bookingId: string, newService: any) => Promise<void>;
}

const ArtistBookingDetails: React.FC<ArtistBookingDetailsProps> = ({ booking, onBack, onAddNewJob }) => {
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const { statusOptions } = useBookingStatusManagement();

  const handleEditService = () => {
    setIsServiceDialogOpen(true);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not scheduled";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const formattedDate = formatDate(booking.Booking_date);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Bookings
        </Button>
        <h3 className="text-lg font-medium">
          Booking #{booking.Booking_NO || booking.id}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-5 space-y-4">
          <h4 className="font-medium border-b pb-2">Service Details</h4>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Job Number:</span>
              <p className="font-medium">#{booking.jobno || "N/A"}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">Service:</span>
              <p className="font-medium">{booking.ServiceName || "N/A"}</p>
            </div>

            {booking.SubService && (
              <div>
                <span className="text-sm text-gray-500">Sub Service:</span>
                <p>{booking.SubService}</p>
              </div>
            )}
            
            {booking.ProductName && (
              <div>
                <span className="text-sm text-gray-500">Product:</span>
                <p>{booking.ProductName}</p>
              </div>
            )}
            
            <div>
              <span className="text-sm text-gray-500">Quantity:</span>
              <p>{booking.Qty || 1}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex items-center space-x-2">
                <StatusBadge status={booking.Status || 'pending'} />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditService}
                className="flex items-center"
              >
                <PenSquare className="mr-2 h-4 w-4" /> Update Status
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-5 space-y-4">
          <h4 className="font-medium border-b pb-2">Appointment Details</h4>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Date:</span>
              <p className="font-medium">{formattedDate}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">Time:</span>
              <p className="font-medium">{booking.booking_time || "Not specified"}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">Customer:</span>
              <p className="font-medium">{booking.name || "N/A"}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">Address:</span>
              <p className="whitespace-pre-line">{booking.Address || "No address provided"}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">Contact:</span>
              <p>{booking.Phone_no || "No contact number"}</p>
            </div>
          </div>
        </div>

        {booking.Purpose && (
          <div className="bg-white border rounded-lg p-5 space-y-4 md:col-span-2">
            <h4 className="font-medium border-b pb-2">Notes</h4>
            <p className="whitespace-pre-line">{booking.Purpose}</p>
          </div>
        )}
      </div>

      <EditServiceDialog 
        isOpen={isServiceDialogOpen} 
        onClose={() => setIsServiceDialogOpen(false)} 
        booking={booking}
      />
    </div>
  );
};

export default ArtistBookingDetails;
