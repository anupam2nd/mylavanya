
import React from "react";
import { format } from "date-fns";
import { Edit, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Booking } from "@/hooks/useBookings";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { BookingDrawerContent } from "./BookingDrawerContent";

interface MobileBookingCardProps {
  booking: Booking;
  handleEditClick: (booking: Booking) => void;
  showEditButton?: boolean; // Add this prop with optional flag
}

export const MobileBookingCard: React.FC<MobileBookingCardProps> = ({
  booking,
  handleEditClick,
  showEditButton = true, // Default to true if not provided
}) => {
  return (
    <div 
      key={booking.id} 
      className="bg-card rounded-lg shadow-sm border p-3 sm:p-4 space-y-2 sm:space-y-3"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-xs sm:text-sm">{booking.Booking_NO}</p>
          <h4 className="font-medium text-sm sm:text-base">{booking.name}</h4>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{booking.email}</p>
          <div className="flex items-center mt-1 text-xs">
            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{booking.Phone_no}</span>
          </div>
        </div>
        <StatusBadge status={booking.Status || 'pending'} />
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Date</p>
          <p>{booking.Booking_date ? format(new Date(booking.Booking_date), 'MMM dd, yyyy') : 'N/A'}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Time</p>
          <p>{booking.booking_time ? booking.booking_time.substring(0, 5) : 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground text-xs">Service</p>
          <p className="truncate">{booking.Purpose}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-1 sm:pt-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs h-7 sm:h-8 px-1.5 sm:px-2">
              View Details
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Booking Details</DrawerTitle>
            </DrawerHeader>
            <BookingDrawerContent booking={booking} handleEditClick={handleEditClick} />
          </DrawerContent>
        </Drawer>
        
        {showEditButton && (
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 sm:h-8 text-xs" 
            onClick={() => handleEditClick(booking)}
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> <span className="hidden xs:inline">Edit</span>
          </Button>
        )}
      </div>
    </div>
  );
};
