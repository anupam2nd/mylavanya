
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import BookingStatusActions from "./BookingStatusActions";

interface ArtistBookingCardProps {
  booking: {
    id: number;
    Booking_NO: string;
    jobno?: number;
    Booking_date: string;
    booking_time: string;
    ServiceName?: string;
    SubService?: string;
    Status: string;
    price?: number;
    Purpose: string;
    Address?: string;
    Pincode?: string | number;
  };
  onStatusUpdated: () => void;
}

const ArtistBookingCard = ({ booking, onStatusUpdated }: ArtistBookingCardProps) => {
  const getStatusColorClass = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'confirmed') return 'bg-blue-500';
    if (normalizedStatus === 'beautician_assigned' || normalizedStatus === 'assigned') return 'bg-purple-500';
    if (normalizedStatus === 'done' || normalizedStatus === 'completed') return 'bg-green-500';
    if (normalizedStatus === 'on the way' || normalizedStatus === 'ontheway') return 'bg-amber-500';
    if (normalizedStatus === 'service_started' || normalizedStatus === 'started') return 'bg-indigo-500';
    return 'bg-gray-500';
  };

  const formatStatusText = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    // Fix the inconsistent display of "started" vs "service_started"
    if (normalizedStatus === 'beautician_assigned') return 'Assigned';
    if (normalizedStatus === 'service_started' || normalizedStatus === 'started') return 'Service Started';
    
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 w-full ${getStatusColorClass(booking.Status)}`} />
      <CardContent className="p-4">
        {/* Smaller title with truncation */}
        <h3 className="text-sm font-medium truncate mb-1">{booking.Purpose}</h3>
        <div className="text-xs text-muted-foreground mb-2">
          <p>Service: {booking.ServiceName} {booking.SubService ? `- ${booking.SubService}` : ''}</p>
          <p>Job #: {booking.jobno || 'N/A'}</p>
        </div>
        
        {/* Customer location section */}
        {booking.Address && (
          <div className="flex items-start text-xs mb-2">
            <MapPin className="w-3 h-3 mr-1 mt-0.5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              {booking.Address}
              {booking.Pincode && `, ${booking.Pincode}`}
            </span>
          </div>
        )}
        
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{booking.Booking_date && format(new Date(booking.Booking_date), 'PP')}</span>
          <Clock className="w-3 h-3 ml-3 mr-1" />
          <span>{booking.booking_time}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className={`px-2 py-1 text-xs font-medium rounded-full 
            ${booking.Status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
              booking.Status === 'beautician_assigned' ? 'bg-purple-100 text-purple-800' : 
                booking.Status === 'done' || booking.Status === 'completed' ? 'bg-green-100 text-green-800' : 
                  booking.Status === 'on the way' || booking.Status === 'ontheway' ? 'bg-amber-100 text-amber-800' :
                    booking.Status === 'service_started' || booking.Status === 'started' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'}`}>
            {formatStatusText(booking.Status)}
          </div>
          <div className="text-sm font-medium">
            ₹{booking.price || 0}
          </div>
        </div>
        
        {/* Add status update buttons */}
        <div className="mt-3 border-t pt-3">
          <BookingStatusActions
            bookingId={booking.id}
            bookingNo={booking.Booking_NO}
            currentStatus={booking.Status}
            onStatusUpdated={onStatusUpdated}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistBookingCard;
