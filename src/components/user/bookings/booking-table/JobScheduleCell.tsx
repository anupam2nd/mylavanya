
import React, { useState } from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { DateTimePicker } from "./DateTimePicker";

interface JobScheduleCellProps {
  booking: Booking;
  onScheduleChange?: (date: string, time: string) => Promise<void>;
  isEditingDisabled: boolean;
  isUpdating?: boolean;
}

export const JobScheduleCell = ({ 
  booking, 
  onScheduleChange,
  isEditingDisabled,
  isUpdating = false
}: JobScheduleCellProps) => {
  const [editingSchedule, setEditingSchedule] = useState(false);
  
  const toggleScheduleEdit = () => {
    setEditingSchedule(prev => !prev);
  };
  
  return (
    <div>
      {editingSchedule && onScheduleChange ? (
        <DateTimePicker 
          booking={booking}
          onSave={onScheduleChange}
          onCancel={toggleScheduleEdit}
        />
      ) : (
        <div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
            <span className="text-sm">{booking.Booking_date}</span>
          </div>
          <div className="flex items-center mt-1">
            <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
            <span className="text-sm">{booking.booking_time}</span>
          </div>
          {!isEditingDisabled && onScheduleChange && (
            <Button 
              variant="link" 
              size="sm" 
              className="h-6 p-0 text-xs mt-1" 
              onClick={toggleScheduleEdit}
              disabled={isUpdating}
            >
              Change schedule
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
