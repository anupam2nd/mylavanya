
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, X, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Booking } from "@/hooks/useBookings";

interface DateTimePickerProps {
  booking: Booking;
  onSave: (date: string, time: string) => void;
  onCancel: () => void;
}

export const DateTimePicker = ({ booking, onSave, onCancel }: DateTimePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(
    booking.Booking_date ? new Date(booking.Booking_date) : undefined
  );
  const [time, setTime] = useState(booking.booking_time?.substring(0, 5) || "");

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left text-xs h-7",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {date ? format(date, "yyyy-MM-dd") : <span>Select date</span>}
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
      </div>
      
      <div>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel} 
          className="h-7 text-xs"
        >
          <X className="h-3 w-3 mr-1" /> Cancel
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => {
            if (date) {
              onSave(format(date, "yyyy-MM-dd"), time);
            }
          }}
          disabled={!date || !time} 
          className="h-7 text-xs"
        >
          <Check className="h-3 w-3 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
};
