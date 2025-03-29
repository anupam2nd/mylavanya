
import { useFormContext } from "react-hook-form";
import { BookingFormValues, timeSlots, requiredFields } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asterisk } from "lucide-react";

const TimePickerField = () => {
  const form = useFormContext<BookingFormValues>();
  
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
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
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
