
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { BookingFormValues, requiredFields } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Calendar } from "@/components/ui/calendar";
import { Asterisk } from "lucide-react";

const DatePickerField = () => {
  const form = useFormContext<BookingFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="flex items-center gap-1">
            Appointment Date
            {requiredFields.date && <Asterisk className="h-3 w-3 text-red-500" />}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <ButtonCustom
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </ButtonCustom>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DatePickerField;
