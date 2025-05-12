
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import BookingStatusActions from "./BookingStatusActions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

interface StatusMapping {
  [key: string]: string;
}

const ArtistBookingCard = ({ booking, onStatusUpdated }: ArtistBookingCardProps) => {
  const [statusMappings, setStatusMappings] = useState<StatusMapping>({});

  useEffect(() => {
    const fetchStatusMappings = async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name');
        
        if (error) throw error;
        
        if (data) {
          const mappings: StatusMapping = {};
          data.forEach(status => {
            mappings[status.status_code.toLowerCase()] = status.status_name;
            mappings[status.status_name.toLowerCase()] = status.status_name;
          });
          setStatusMappings(mappings);
        }
      } catch (error) {
        console.error("Error fetching status mappings:", error);
      }
    };
    
    fetchStatusMappings();
  }, []);

  const getStatusColorClass = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    // Check if status is in our mappings
    if (statusMappings[normalizedStatus]) {
      const mappedStatus = statusMappings[normalizedStatus].toLowerCase();
      
      if (mappedStatus.includes("complete") || mappedStatus.includes("done")) {
        return 'bg-green-500';
      } else if (mappedStatus === 'confirmed') {
        return 'bg-blue-500';
      } else if (mappedStatus.includes('assigned')) {
        return 'bg-purple-500';
      } else if (mappedStatus.includes('on the way')) {
        return 'bg-amber-500';
      } else if (mappedStatus.includes('started')) {
        return 'bg-indigo-500';
      }
    }
    
    // Fallback to direct status checks
    if (normalizedStatus === 'confirmed') return 'bg-blue-500';
    if (normalizedStatus.includes('assigned')) return 'bg-purple-500';
    if (normalizedStatus === 'done' || normalizedStatus === 'completed' || normalizedStatus === 'complete') return 'bg-green-500';
    if (normalizedStatus.includes('on the way')) return 'bg-amber-500';
    if (normalizedStatus.includes('started')) return 'bg-indigo-500';
    
    return 'bg-gray-500';
  };

  const formatStatusText = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    // Try to get the display name from our mappings
    if (statusMappings[normalizedStatus]) {
      return statusMappings[normalizedStatus];
    }
    
    // Fallback to manual formatting
    if (normalizedStatus === 'beautician_assigned') return 'Assigned';
    if (normalizedStatus === 'service_started' || normalizedStatus === 'started') return 'Service Started';
    
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusBgClass = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    // Check if status is in our mappings
    if (statusMappings[normalizedStatus]) {
      const mappedStatus = statusMappings[normalizedStatus].toLowerCase();
      
      if (mappedStatus.includes("complete") || mappedStatus.includes("done")) {
        return 'bg-green-100 text-green-800';
      } else if (mappedStatus === 'confirmed') {
        return 'bg-blue-100 text-blue-800';
      } else if (mappedStatus.includes('assigned')) {
        return 'bg-purple-100 text-purple-800';
      } else if (mappedStatus.includes('on the way')) {
        return 'bg-amber-100 text-amber-800';
      } else if (mappedStatus.includes('started')) {
        return 'bg-indigo-100 text-indigo-800';
      }
    }
    
    // Fallback to direct status checks
    if (normalizedStatus === 'confirmed') return 'bg-blue-100 text-blue-800';
    if (normalizedStatus.includes('assigned')) return 'bg-purple-100 text-purple-800';
    if (normalizedStatus === 'done' || normalizedStatus === 'completed' || normalizedStatus === 'complete') 
      return 'bg-green-100 text-green-800';
    if (normalizedStatus.includes('on the way')) return 'bg-amber-100 text-amber-800';
    if (normalizedStatus.includes('started')) return 'bg-indigo-100 text-indigo-800';
    
    return 'bg-gray-100 text-gray-800';
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
          <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBgClass(booking.Status)}`}>
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
