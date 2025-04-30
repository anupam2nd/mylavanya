
import { Booking } from "@/hooks/useBookings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface BookingDetailsModalProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getArtistName: (artistId?: number) => string;
  getArtistPhone: (artistId?: number) => string;
}

const BookingDetailsModal = ({ 
  booking, 
  open, 
  onOpenChange,
  getArtistName,
  getArtistPhone
}: BookingDetailsModalProps) => {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Service</p>
            <div>
              <p>{booking.Purpose}</p>
              {booking.ServiceName && booking.ServiceName !== booking.Purpose && (
                <p className="text-sm text-muted-foreground mt-1">{booking.ServiceName}</p>
              )}
              {booking.SubService && (
                <p className="text-sm text-muted-foreground">{booking.SubService}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Date</p>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{booking.Booking_date}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Time</p>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{booking.booking_time}</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Booking #</p>
            <p>{booking.Booking_NO}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Status</p>
            <StatusBadge status={booking.Status || 'pending'} />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Artist</p>
            {booking.ArtistId ? (
              <div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{getArtistName(booking.ArtistId)}</span>
                </div>
                {getArtistPhone(booking.ArtistId) && (
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{getArtistPhone(booking.ArtistId)}</span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Not assigned</span>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Customer</p>
            <p>{booking.name}</p>
            <p className="text-sm text-muted-foreground">{booking.email}</p>
            <div className="flex items-center mt-1">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{booking.Phone_no}</span>
            </div>
          </div>
          
          {booking.Address && (
            <div>
              <p className="text-sm font-medium mb-1">Address</p>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <p>{booking.Address}</p>
                  {booking.Pincode && <p className="text-sm">PIN: {booking.Pincode}</p>}
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
