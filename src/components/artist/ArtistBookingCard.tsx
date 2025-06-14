
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, Calendar, User, MapPin } from "lucide-react";
import { useState } from "react";
import StatusUpdateDialog from "./StatusUpdateDialog";

interface ArtistBookingCardProps {
  booking: any;
  onStatusUpdated: () => void;
  isListView?: boolean;
}

const ArtistBookingCard = ({ booking, onStatusUpdated, isListView = false }: ArtistBookingCardProps) => {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const handleStatusUpdate = () => {
    setIsStatusDialogOpen(true);
  };

  if (isListView) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStatusUpdate}
          className="text-xs h-7 text-primary hover:text-primary-foreground hover:bg-primary"
        >
          Update Status
        </Button>
        
        <StatusUpdateDialog
          open={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          booking={booking}
          onStatusUpdated={onStatusUpdated}
        />
      </>
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-1">
                {booking.Purpose || booking.ServiceName}
              </h3>
              {booking.SubService && (
                <p className="text-xs text-muted-foreground">{booking.SubService}</p>
              )}
            </div>
            <div className="text-right">
              <div className="font-medium text-sm">₹{booking.price || 'N/A'}</div>
              {booking.Qty && booking.Qty > 1 && (
                <div className="text-xs text-muted-foreground">Qty: {booking.Qty}</div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{booking.Booking_date}</span>
              <Clock className="h-3 w-3 ml-3 mr-1" />
              <span>{booking.booking_time}</span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              <span>{booking.name}</span>
            </div>
            
            {booking.Address && (
              <div className="flex items-start text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span className="truncate">
                  {booking.Address}
                  {booking.Pincode && `, ${booking.Pincode}`}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <StatusBadge status={booking.Status || 'pending'} className="text-xs" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStatusUpdate}
              className="text-xs h-7 text-primary hover:text-primary-foreground hover:bg-primary"
            >
              Update Status
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <StatusUpdateDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        booking={booking}
        onStatusUpdated={onStatusUpdated}
      />
    </>
  );
};

export default ArtistBookingCard;
