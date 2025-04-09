
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Search, SortAsc, SortDesc } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterDateType, SortDirection, SortField } from "@/hooks/useBookingFilters";

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
  statusOptions: { value: string; label: string }[];
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  filterDateType?: FilterDateType;
  setFilterDateType?: (type: FilterDateType) => void;
  sortDirection?: SortDirection;
  setSortDirection?: (direction: SortDirection) => void;
  sortField?: SortField;
  setSortField?: (field: SortField) => void;
}

const BookingFilters = ({
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
  filterDateType = "booking_date", 
  setFilterDateType,
  sortDirection = "desc",
  setSortDirection,
  sortField = "booking_date",
  setSortField
}: BookingFiltersProps) => {
  
  const dateRangeValue: DateRange = {
    from: startDate,
    to: endDate
  };

  const handleSortToggle = () => {
    if (setSortDirection) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    }
  };

  const handleSetSortField = (field: SortField) => {
    if (setSortField) {
      setSortField(field);
    }
  };

  const handleSetFilterDateType = (type: FilterDateType) => {
    if (setFilterDateType) {
      setFilterDateType(type);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
      <div className="relative w-full md:w-auto flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or booking..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex gap-2 w-full md:w-auto">
        <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 md:flex-none">
              <Calendar className="mr-2 h-4 w-4" />
              {startDate ? (
                endDate ? (
                  <>
                    {format(startDate, "MMM d")} - {format(endDate, "MMM d")}
                  </>
                ) : (
                  format(startDate, "MMM d, yyyy")
                )
              ) : (
                "Choose Daterange"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-2 border-b">
              <div className="flex items-center justify-between">
                <div className="space-x-1">
                  <Button 
                    size="sm" 
                    variant={filterDateType === "booking_date" ? "default" : "outline"}
                    onClick={() => handleSetFilterDateType("booking_date")}
                    className="text-xs h-7"
                  >
                    Booking Date
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterDateType === "creation_date" ? "default" : "outline"}
                    onClick={() => handleSetFilterDateType("creation_date")}
                    className="text-xs h-7"
                  >
                    Creation Date
                  </Button>
                </div>
              </div>
            </div>
            <CalendarComponent
              initialFocus
              mode="range"
              selected={dateRangeValue}
              onSelect={(range) => {
                setStartDate(range?.from);
                setEndDate(range?.to);
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        {setSortDirection && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {sortDirection === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSortToggle}>
                {sortDirection === "desc" ? "Oldest First" : "Newest First"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSetSortField("booking_date")}
                className={sortField === "booking_date" ? "bg-accent" : ""}
              >
                Sort by Booking Date
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSetSortField("creation_date")}
                className={sortField === "creation_date" ? "bg-accent" : ""}
              >
                Sort by Creation Date
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <Button variant="outline" onClick={clearFilters} size="sm">
        Clear
      </Button>
    </div>
  );
};

export default BookingFilters;
