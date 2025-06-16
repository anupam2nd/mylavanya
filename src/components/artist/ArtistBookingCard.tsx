
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, Calendar, User, MapPin } from "lucide-react";
import BookingStatusActions from "./BookingStatusActions";

interface ArtistBookingCardProps {
  booking: any;
  onStatusUpdated: () => void;
  isListView?: boolean;
}

const ArtistBookingCard = ({ booking, onStatusUpdated, isListView = false }: ArtistBookingCardProps) => {
  if (isListView) {
    return (
      <BookingStatusActions
        booking={booking}
        onStatusUpdated={onStatusUpdated}
      />
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-xs sm:text-sm mb-1 line-clamp-2">
              {booking.Purpose || booking.ServiceName}
            </h3>
            {booking.SubService && (
              <p className="text-xs text-muted-foreground truncate">{booking.SubService}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="font-medium text-xs sm:text-sm">₹{booking.price || 'N/A'}</div>
            {booking.Qty && booking.Qty > 1 && (
              <div className="text-xs text-muted-foreground">Qty: {booking.Qty}</div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{booking.Booking_date}</span>
            <Clock className="h-3 w-3 ml-2 mr-1 shrink-0" />
            <span className="truncate">{booking.booking_time}</span>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{booking.name}</span>
          </div>
          
          {booking.Address && (
            <div className="flex items-start text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
              <span className="line-clamp-2 break-words text-xs">
                {booking.Address}
                {booking.Pincode && `, ${booking.Pincode}`}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <StatusBadge status={booking.Status || 'pending'} className="text-xs w-fit" />
          <BookingStatusActions
            booking={booking}
            onStatusUpdated={onStatusUpdated}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistBookingCard;
