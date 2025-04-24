
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
    // Add the hour slot (e.g., "09:00 AM")
    slots.push(
      `${hour.toString().padStart(2, "0")}:00 ${hour >= 12 ? "PM" : "AM"}`
    );
    
    // Skip the 7:30 PM slot
    if (hour !== endHour) {
      // Add the half-hour slot (e.g., "09:30 AM")
      slots.push(
        `${hour.toString().padStart(2, "0")}:30 ${hour >= 12 ? "PM" : "AM"}`
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
  
  // Convert 24-hour format to 12-hour format with AM/PM
  const formatTimeFor12Hour = (time24h: string): string => {
    if (!time24h) return "";
    
    const [hours, minutes] = time24h.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12.toString().padStart(2, "0")}:${minutes} ${period}`;
  };
  
  // Convert 12-hour format to 24-hour format for internal use
  const formatTimeFor24Hour = (time12h: string): string => {
    if (!time12h) return "";
    
    const [timePart, period] = time12h.split(" ");
    const [hours, minutes] = timePart.split(":");
    let hour = parseInt(hours, 10);
    
    // Convert to 24-hour format
    if (period === "PM" && hour < 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  };

  return (
    <div className="flex items-center">
      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
      <Select
        value={value ? formatTimeFor12Hour(value) : undefined}
        onValueChange={(timeValue) => onChange(formatTimeFor24Hour(timeValue))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a time slot" />
        </SelectTrigger>
        <SelectContent>
          {timeSlots.map((timeSlot) => (
            <SelectItem key={timeSlot} value={timeSlot}>
              {timeSlot}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSlotPicker;
