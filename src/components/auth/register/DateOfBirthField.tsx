import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { RegisterFormValues } from "./RegisterFormSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asterisk } from "lucide-react";

export default function DateOfBirthField() {
  const form = useFormContext<RegisterFormValues>();
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Get years starting from 7 years ago
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100; // Allow up to 100 years back
  const maxYear = currentYear - 7; // Must be at least 7 years old
  
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  // Handle manual month and year selection
  const handleYearChange = (selectedYear: string) => {
    const yearValue = parseInt(selectedYear, 10);
    setYear(yearValue);
    
    // If both month and year are selected, update the date
    if (month !== undefined) {
      const newDate = new Date(yearValue, month, 1);
      form.setValue("dob", newDate, { shouldValidate: true });
    }
  };

  const handleMonthChange = (selectedMonth: string) => {
    const monthValue = parseInt(selectedMonth, 10);
    setMonth(monthValue);
    
    // If both month and year are selected, update the date
    if (year !== undefined) {
      const newDate = new Date(year, monthValue, 1);
      form.setValue("dob", newDate, { shouldValidate: true });
    }
  };

  // When a date is selected from calendar, update the month and year states
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setMonth(date.getMonth());
      setYear(date.getFullYear());
    }
  };

  // When the form field value changes (from any source), update our local state
  useEffect(() => {
    const currentDate = form.getValues("dob");
    if (currentDate) {
      setMonth(currentDate.getMonth());
      setYear(currentDate.getFullYear());
    }
  }, [form.getValues("dob")]);

  // Set default view date for calendar based on selected month and year
  const getDefaultCalendarDate = () => {
    if (year && month !== undefined) {
      return new Date(year, month, 1);
    }
    return undefined;
  };

  return (
    <FormField
      control={form.control}
      name="dob"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="flex items-center gap-1">
            Date of Birth (must be at least 7 years old) <Asterisk className="h-3 w-3 text-red-500" />
          </FormLabel>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <Select
                onValueChange={handleMonthChange}
                value={month !== undefined ? month.toString() : undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent position="popper" className="overflow-y-auto max-h-[200px] z-50">
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                onValueChange={handleYearChange}
                value={year !== undefined ? year.toString() : undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent position="popper" className="overflow-y-auto max-h-[200px] z-50">
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
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
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  field.onChange(date);
                  handleCalendarSelect(date);
                  setCalendarOpen(false); // Close popover when date is selected
                }}
                defaultMonth={getDefaultCalendarDate()}
                disabled={(date) => {
                  // Disable dates less than 7 years ago
                  const today = new Date();
                  const sevenYearsAgo = new Date();
                  sevenYearsAgo.setFullYear(today.getFullYear() - 7);
                  return date > sevenYearsAgo || date > today;
                }}
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
}
