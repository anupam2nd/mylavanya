
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FilterDateType } from "@/hooks/useBookingFilters";

interface DateFilterProps {
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  showDateFilter: boolean;
  filterDateType: FilterDateType;
  setFilterDateType: (type: FilterDateType) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showDateFilter,
  filterDateType,
  setFilterDateType,
}) => {
  const [date, setDate] = useState<DateRange | undefined>(
    startDate && endDate ? {
      from: startDate,
      to: endDate
    } : undefined
  );

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from) {
      setStartDate(range.from);
    } else {
      setStartDate(undefined);
    }
    if (range?.to) {
      setEndDate(range.to);
    } else {
      setEndDate(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 px-4">
          <CalendarIcon className="mr-2 h-4 w-4" /> 
          {showDateFilter ? `${filterDateType === "booking" ? "Booking" : "Creation"} date` : "Date range"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-2 flex gap-2">
          <Select
            value={filterDateType}
            onValueChange={(value) => setFilterDateType(value as FilterDateType)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Date type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking">Booking date</SelectItem>
              <SelectItem value="creation">Creation date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={startDate}
          selected={date}
          onSelect={handleDateSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};
