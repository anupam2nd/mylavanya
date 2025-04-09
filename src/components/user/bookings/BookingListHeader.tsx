
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Define proper types for the filters
export type FilterDateType = "booking_date" | "creation_date";
export type SortDirection = "asc" | "desc";
export type SortField = "booking_date" | "creation_date"; 

interface BookingListHeaderProps {
  filteredBookings: any[];
  bookings: any[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  clearFilters: () => void;
  formattedStatusOptions: { value: string; label: string }[];
  showDateFilter: boolean;
  setShowDateFilter: (value: boolean) => void;
  filterDateType: FilterDateType;
  setFilterDateType: (value: FilterDateType) => void;
  sortDirection: SortDirection;
  setSortDirection: (value: SortDirection) => void;
  sortField: SortField;
  setSortField: (value: SortField) => void;
  bookingHeaders: Record<string, string>;
}

export const BookingListHeader = ({
  filteredBookings,
  bookings,
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  statusFilter,
  setStatusFilter,
  clearFilters,
  formattedStatusOptions,
  showDateFilter,
  setShowDateFilter,
  filterDateType,
  setFilterDateType,
  sortDirection,
  setSortDirection,
  sortField,
  setSortField,
  bookingHeaders
}: BookingListHeaderProps) => {
  return (
    <>
      <div className="flex flex-1 flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or booking number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {formattedStatusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowDateFilter(!showDateFilter)} 
            className="whitespace-nowrap"
          >
            {showDateFilter ? "Hide Date Filters" : "Show Date Filters"}
          </Button>
          
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>
      
      {showDateFilter && (
        <div className="flex flex-wrap gap-2 mt-2 w-full">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground whitespace-nowrap">Filter by:</p>
            <Select value={filterDateType} onValueChange={(value) => setFilterDateType(value as FilterDateType)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking_date">Booking Date</SelectItem>
                <SelectItem value="creation_date">Creation Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[150px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                {startDate ? format(startDate, "PPP") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[150px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                {endDate ? format(endDate, "PPP") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</p>
            <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking_date">Booking Date</SelectItem>
                <SelectItem value="creation_date">Creation Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirection)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Oldest First</SelectItem>
              <SelectItem value="desc">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};
