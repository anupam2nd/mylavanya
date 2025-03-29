
import React from "react";
import { Search, Filter } from "lucide-react";
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
import { Calendar } from "lucide-react";
import { FormattedStatusOption } from "@/hooks/useStatusOptions";

interface UserBookingFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  clearFilters: () => void;
  statusOptions: FormattedStatusOption[];
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  filterDateType: FilterDateType;
  setFilterDateType: (type: FilterDateType) => void;
}

const UserBookingFilters: React.FC<UserBookingFiltersProps> = ({
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-1 w-full sm:w-auto bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-200"
          >
            <Filter className="h-4 w-4 mr-1" />
            {startDate && endDate ? (
              <span className="text-xs">
                {format(startDate, "MMM dd")} - {format(endDate, "MMM dd")}
              </span>
            ) : (
              "Filter Bookings"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 z-50 bg-white shadow-md" align="end">
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
                    <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
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
                    <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
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
                <SelectContent className="bg-white z-50">
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

export default UserBookingFilters;
