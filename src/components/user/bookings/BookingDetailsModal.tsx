
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Phone, Calendar, Clock, User, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Booking } from "@/hooks/useBookings";
import { StatusBadge } from "@/components/ui/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

interface BookingDetailsModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ArtistDetails {
  ArtistFirstName?: string;
  ArtistLastName?: string;
  ArtistPhno?: number;
  emailid?: string;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  open,
  onOpenChange,
}) => {
  const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      if (!booking?.ArtistId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("ArtistMST")
          .select("ArtistFirstName, ArtistLastName, ArtistPhno, emailid")
          .eq("ArtistId", booking.ArtistId)
          .single();

        if (error) throw error;
        setArtistDetails(data);
      } catch (error) {
        console.error("Error fetching artist details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open && booking?.ArtistId) {
      fetchArtistDetails();
    } else {
      setArtistDetails(null);
    }
  }, [booking, open]);

  if (!booking) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    return timeString.substring(0, 5);
  };

  const formatPhoneNumber = (phone: number | undefined) => {
    if (!phone) return "Not available";
    return phone.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Your booking reference is <span className="font-medium">{booking.Booking_NO}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{booking.Purpose}</h3>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(booking.Booking_date)}</span>
              <Clock className="h-4 w-4 ml-3 mr-1" />
              <span>{formatTime(booking.booking_time)}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
            <StatusBadge status={booking.Status || 'pending'} />
          </div>

          <Separator />

          {booking.Address && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Service Location</p>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                <p>{booking.Address}{booking.Pincode ? `, ${booking.Pincode}` : ""}</p>
              </div>
            </div>
          )}
          
          {artistDetails && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Artist Assigned</p>
              <div className="space-y-1">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p>
                    {artistDetails.ArtistFirstName} {artistDetails.ArtistLastName}
                  </p>
                </div>
                {artistDetails.ArtistPhno && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                    <p>{formatPhoneNumber(artistDetails.ArtistPhno)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pricing</p>
            <p className="font-medium">₹{booking.price || 0}</p>
          </div>

          {booking.ServiceName && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Service Category</p>
              <p>{booking.ServiceName}</p>
            </div>
          )}

          {booking.SubService && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Sub Service</p>
              <p>{booking.SubService}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
