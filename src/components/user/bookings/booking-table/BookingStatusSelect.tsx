
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  // Find the current status name
  const currentStatusOption = statusOptions.find(option => option.status_code === currentStatus);
  const defaultValue = currentStatus || 'pending';
  
  return (
    <Select
      onValueChange={(value) => onStatusChange(value)}
      defaultValue={defaultValue}
      disabled={isDisabled}
    >
      <SelectTrigger className="h-7 text-xs mt-2">
        <SelectValue>
          {currentStatusOption?.status_name || "Change Status"}
        </SelectValue>
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
