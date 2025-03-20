
import React, { useState } from "react";
import { format } from "date-fns";
import { Edit, ChevronDown, ChevronUp, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { Booking } from "@/hooks/useBookings";
import { BookingDrawerContent } from "./BookingDrawerContent";
import { useAuth } from "@/context/AuthContext";

interface MobileBookingCardProps {
  booking: Booking;
  handleEditClick: (booking: Booking) => void;
  isDeactivateMode: boolean;
}

export const MobileBookingCard: React.FC<MobileBookingCardProps> = ({ 
  booking, 
  handleEditClick,
  isDeactivateMode
}) => {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const canEdit = user && ['user', 'admin', 'superadmin'].includes(user.role);

  const handleDeactivate = (booking: Booking) => {
    // For now, this is just a placeholder. The actual deactivation logic
    // will be implemented when we connect this to the API
    console.log("Deactivate booking:", booking.id);
    // In a real implementation, we would set the status to 'inactive' or similar
  };

  const handleDelete = (booking: Booking) => {
    // For superadmin only - placeholder for delete functionality
    console.log("Delete booking:", booking.id);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{booking.Booking_NO}</span>
              <StatusBadge status={booking.Status || 'pending'} />
            </div>
            <span className="text-sm text-muted-foreground">
              {booking.name}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">₹{booking.price}</div>
            <div className="text-xs text-muted-foreground">
              {booking.Booking_date ? format(new Date(booking.Booking_date), 'MMM dd, yyyy') : '—'}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="p-4 border-b space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground text-xs">Service</p>
                <p className="text-sm">{booking.Purpose}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Time</p>
                <p className="text-sm">
                  {booking.booking_time ? booking.booking_time.substring(0, 5) : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Customer</p>
                <p className="text-sm">{booking.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="text-sm">{booking.Phone_no}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between py-2 px-4 bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" /> Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" /> More
            </>
          )}
        </Button>
        <div className="flex space-x-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
                View
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="max-w-md mx-auto">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Booking Details</h2>
                </div>
                <BookingDrawerContent
                  booking={booking}
                  handleEditClick={handleEditClick}
                />
              </div>
            </DrawerContent>
          </Drawer>

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditClick(booking)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}

          {isDeactivateMode ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeactivate(booking)}
            >
              <XCircle className="h-4 w-4 mr-1" /> Deactivate
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(booking)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
