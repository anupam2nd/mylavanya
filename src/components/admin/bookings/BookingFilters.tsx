
import React from "react";
import { Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterDateType } from "@/hooks/useBookingFilters";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BookingFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  clearFilters: () => void;
  statusOptions: { status_code: string; status_name: string }[];
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  filterDateType: FilterDateType;
  setFilterDateType: (type: FilterDateType) => void;
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
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <Button 
        variant="outline" 
        onClick={() => setShowDateFilter(true)}
        className="flex items-center gap-1"
      >
        Advanced Filters
      </Button>
      <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
        <PopoverContent className="w-80" align="end">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filter Date By</h4>
              <RadioGroup 
                value={filterDateType}
                onValueChange={(value) => setFilterDateType(value as FilterDateType)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="booking" id="booking-date" />
                  <Label htmlFor="booking-date">Booking Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creation" id="creation-date" />
                  <Label htmlFor="creation-date">Creation Date</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Date Range</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="start-date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "MMM dd, yyyy") : <span>Pick date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="end-date">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="end-date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "MMM dd, yyyy") : <span>Pick date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Status</h4>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions && statusOptions.map((option) => (
                    <SelectItem key={option.status_code} value={option.status_code}>
                      {option.status_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowDateFilter(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BookingFilters;
