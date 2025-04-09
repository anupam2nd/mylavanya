
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Booking } from "@/hooks/useBookings";

interface BookingStatusSelectProps {
  booking: Booking;
  statusOptions: {status_code: string; status_name: string}[];
  onStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
}

export const BookingStatusSelect = ({ 
  booking, 
  statusOptions, 
  onStatusChange 
}: BookingStatusSelectProps) => {
  return (
    <Select
      onValueChange={(value) => onStatusChange(booking, value)}
      defaultValue={booking.Status || 'pending'}
    >
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder="Change Status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem 
            key={option.status_code} 
            value={option.status_code}
          >
            {option.status_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
