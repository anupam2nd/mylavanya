
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, X } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  booking: Booking;
  onSave: (date: string, time: string) => Promise<void>;
  onCancel: () => void;
}

export const DateTimePicker = ({ booking, onSave, onCancel }: DateTimePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(
    booking.Booking_date ? new Date(booking.Booking_date) : undefined
  );
  const [time, setTime] = useState(booking.booking_time?.substring(0, 5) || "09:00");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!date) return;
    
    setIsSaving(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      await onSave(formattedDate, time);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left text-xs",
              !date && "text-muted-foreground"
            )}
            size="sm"
          >
            <CalendarIcon className="mr-2 h-3 w-3" />
            {date ? format(date, 'PPP') : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="flex items-center space-x-2">
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleSave} 
          disabled={!date || isSaving}
          className="text-xs"
        >
          <Check className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
};
