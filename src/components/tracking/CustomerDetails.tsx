
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingData } from "./BookingDetails";
import { Phone } from "lucide-react";
import { useStatusOptions } from "@/hooks/useStatusOptions";

interface CustomerDetailsProps {
  booking: BookingData;
}

const CustomerDetails = ({ booking }: CustomerDetailsProps) => {
  const { statusOptions } = useStatusOptions();
  
  // Find the status description if available
  const statusDetails = statusOptions.find(
    option => option.status_code === booking.Status
  );
  
  return (
    <>
      {booking.name && (
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="font-medium">{booking.name}</p>
        </div>
      )}
      
      {booking.email && (
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="font-medium">{booking.email}</p>
        </div>
      )}
      
      {booking.Phone_no && (
        <div>
          <p className="text-sm font-medium text-gray-500">Phone</p>
          <p className="font-medium flex items-center">
            <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
            {booking.Phone_no}
          </p>
        </div>
      )}
      
      <div>
        <p className="text-sm font-medium text-gray-500">Status</p>
        <StatusBadge 
          status={booking.Status || 'pending'} 
          description={statusDetails?.description}
          showTooltip={!!statusDetails?.description}
        />
        {statusDetails?.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {statusDetails.description}
          </p>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500">Booking Date</p>
        <p className="font-medium">{booking.Booking_date}</p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500">Booking Time</p>
        <p className="font-medium">{booking.booking_time}</p>
      </div>
      
      {booking.Address && (
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-500">Address</p>
          <p className="font-medium">{booking.Address}</p>
        </div>
      )}
      
      {booking.Pincode && (
        <div>
          <p className="text-sm font-medium text-gray-500">Pincode</p>
          <p className="font-medium">{booking.Pincode}</p>
        </div>
      )}
    </>
  );
};

export default CustomerDetails;
