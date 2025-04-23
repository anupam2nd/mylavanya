
import { useState } from "react";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Generate time slots in 30-minute increments from 9:00 AM to 7:00 PM
// Using consistent 12-hour format for all times
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 19; // 7 PM

  for (let hour = startHour; hour <= endHour; hour++) {
    // Add the hour slot (e.g., "09:00 AM")
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    
    slots.push(
      `${hour12.toString().padStart(2, "0")}:00 ${period}`
    );
    
    // Skip the 7:30 PM slot
    if (hour !== endHour) {
      // Add the half-hour slot (e.g., "09:30 AM")
      slots.push(
        `${hour12.toString().padStart(2, "0")}:30 ${period}`
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
  
  // Format display value (ensure we show 12h format)
  const displayValue = value ? value : "";
  
  // Log when value changes
  const handleValueChange = (newValue: string) => {
    console.log("TimeSlotPicker value changed:", newValue);
    onChange(newValue);
  };

  return (
    <div className="flex items-center">
      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
      <Select
        value={value || undefined}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a time slot">
            {displayValue || "Select a time slot"}
          </SelectValue>
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
