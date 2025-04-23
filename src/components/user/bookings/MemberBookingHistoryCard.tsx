
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar, Clock } from "lucide-react";

interface MemberBookingHistoryCardProps {
  booking: Booking;
  onView?: (booking: Booking) => void;
}

export const MemberBookingHistoryCard: React.FC<MemberBookingHistoryCardProps> = ({
  booking,
  onView,
}) => {
  return (
    <Card className="hover:shadow-md group cursor-pointer transition-shadow duration-200" onClick={() => onView && onView(booking)}>
      <CardContent className="py-4 px-6 flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg text-primary">{booking.ProductName || booking.ServiceName || "Service"}</span>
            <StatusBadge status={booking.Status || "pending"} className="ml-2" />
          </div>
          <div className="text-sm text-gray-500 mb-2">{booking.Purpose}</div>
          <div className="flex items-center text-muted-foreground text-xs gap-6">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{booking.Booking_date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{booking.booking_time}</span>
            </div>
            {booking.Qty && (
              <div>
                x{booking.Qty}
              </div>
            )}
          </div>
        </div>
        <div className="flex-none flex flex-col items-end gap-1 mt-2 sm:mt-0">
          <div className="font-medium text-base">
            ₹{booking.price || 0}
          </div>
          {booking.Status && (
            <div className="text-xs mt-1 text-muted-foreground">
              Status: <span className="font-medium">{booking.Status.toUpperCase()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberBookingHistoryCard;
