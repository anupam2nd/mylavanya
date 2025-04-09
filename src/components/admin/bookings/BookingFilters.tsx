
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { FilterX, Search, Calendar as CalendarIcon, ArrowDownUp } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FilterDateType, SortDirection, SortField } from "@/hooks/useBookingFilters";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface BookingFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  clearFilters: () => void;
  statusOptions: { value: string; label: string }[];
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  filterDateType: FilterDateType;
  setFilterDateType: (type: FilterDateType) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  statusFilter,
  setStatusFilter,
  clearFilters,
  statusOptions,
  showDateFilter,
  setShowDateFilter,
  filterDateType,
  setFilterDateType,
  sortDirection,
  setSortDirection,
  sortField,
  setSortField,
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
    <div className="flex flex-wrap gap-2 items-center justify-end">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 w-auto md:w-[250px]"
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 px-4">
            <CalendarIcon className="mr-2 h-4 w-4" /> 
            {showDateFilter ? `${filterDateType === "booking_date" ? "Booking" : "Creation"} date` : "Date range"}
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
                <SelectItem value="booking_date">Booking date</SelectItem>
                <SelectItem value="creation_date">Creation date</SelectItem>
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={sortField === "creation_date" ? "bg-secondary" : ""}
            onClick={() => setSortField("creation_date")}
          >
            Creation date
          </DropdownMenuItem>
          <DropdownMenuItem
            className={sortField === "booking_date" ? "bg-secondary" : ""}
            onClick={() => setSortField("booking_date")}
          >
            Booking date
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={sortDirection === "desc" ? "bg-secondary" : ""}
            onClick={() => setSortDirection("desc")}
          >
            Newest first
          </DropdownMenuItem>
          <DropdownMenuItem
            className={sortDirection === "asc" ? "bg-secondary" : ""}
            onClick={() => setSortDirection("asc")}
          >
            Oldest first
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {(startDate || endDate || statusFilter !== "all" || searchQuery) && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-9"
        >
          <FilterX className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default BookingFilters;
