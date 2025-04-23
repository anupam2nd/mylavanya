
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Generate time slots in 30-minute increments from 9:00 AM to 7:00 PM
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 19; // 7 PM

  for (let hour = startHour; hour <= endHour; hour++) {
    // Add the hour slot (e.g., "09:00")
    slots.push(
      `${hour.toString().padStart(2, "0")}:00`
    );
    
    // Skip the 7:30 PM slot
    if (hour !== endHour) {
      // Add the half-hour slot (e.g., "09:30")
      slots.push(
        `${hour.toString().padStart(2, "0")}:30`
      );
    }
  }

  return slots;
};

interface TimeSlotPickerProps {
  value: string;
  onChange: (time: string) => void;
}

const TimeSlotPicker = ({ value, onChange }: TimeSlotPickerProps) => {
  const [timeSlots] = useState(generateTimeSlots());
  
  // Format for display (convert 24h to 12h format)
  const formatFor12Hour = (time24h: string): string => {
    if (!time24h) return "";
    
    const [hours, minutes] = time24h.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12.toString().padStart(2, "0")}:${minutes} ${period}`;
  };

  return (
    <div className="flex items-center">
      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
      <Select
        value={value || undefined}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a time slot">
            {value ? formatFor12Hour(value) : "Select a time slot"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {timeSlots.map((timeSlot) => (
            <SelectItem key={timeSlot} value={timeSlot}>
              {formatFor12Hour(timeSlot)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSlotPicker;
