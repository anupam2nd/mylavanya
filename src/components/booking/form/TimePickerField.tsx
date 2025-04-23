
import { useFormContext } from "react-hook-form";
import { BookingFormValues, timeSlots, requiredFields } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asterisk } from "lucide-react";

const TimePickerField = () => {
  const form = useFormContext<BookingFormValues>();
  
  // Generate time slots in 24-hour format for database compatibility
  const formattedTimeSlots = timeSlots.map(time => {
    // Return the time as is, as we'll handle conversion in useBookingSubmit
    return time;
  });
  
  return (
    <FormField
      control={form.control}
      name="selectedTime"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            Preferred Time
            {requiredFields.selectedTime && <Asterisk className="h-3 w-3 text-red-500" />}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {formattedTimeSlots.map((time) => (
                <SelectItem 
                  key={time || "not_specified"} 
                  value={time || "not_specified"}
                >
                  {time || "Not specified"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimePickerField;
