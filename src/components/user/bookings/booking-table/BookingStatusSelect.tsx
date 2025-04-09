
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Booking } from "@/hooks/useBookings";

interface BookingStatusSelectProps {
  currentStatus: string;
  statusOptions: {status_code: string; status_name: string}[];
  onStatusChange: (newStatus: string) => Promise<void>;
  isDisabled: boolean;
}

export const BookingStatusSelect = ({ 
  currentStatus, 
  statusOptions, 
  onStatusChange,
  isDisabled 
}: BookingStatusSelectProps) => {
  // Ensure we have a valid default value - never empty string
  const defaultValue = currentStatus || 'pending';
  
  return (
    <Select
      onValueChange={(value) => onStatusChange(value)}
      defaultValue={defaultValue}
      disabled={isDisabled}
    >
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder="Change Status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem 
            key={option.status_code} 
            value={option.status_code || 'pending'} // Ensure value is never empty
          >
            {option.status_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
