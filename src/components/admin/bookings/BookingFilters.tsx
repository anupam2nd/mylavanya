
import { useState } from "react";
import { Calendar, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SearchFilter } from "./filters/SearchFilter";
import { StatusFilter } from "./filters/StatusFilter";
import { DateFilter } from "./filters/DateFilter";
import { SortFilter } from "./filters/SortFilter";
import { ArtistFilter } from "./filters/ArtistFilter";
import { ClearFiltersButton } from "./filters/ClearFiltersButton";
import type { FilterDateType, SortDirection, SortField } from "@/hooks/useBookingFilters";

interface BookingFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  startDate?: Date;
  setStartDate: (date: Date | undefined) => void;
  endDate?: Date;
  setEndDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  clearFilters: () => void;
  statusOptions: Array<{ value: string; label: string }>;
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  filterDateType: FilterDateType;
  setFilterDateType: (type: FilterDateType) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  artistFilter?: string;
  setArtistFilter?: (artist: string) => void;
  artistOptions?: Array<{ value: string; label: string; empCode: string }>;
  getArtistName?: (id: number) => string;
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
  filterDateType,
  setFilterDateType,
  sortDirection,
  setSortDirection,
  sortField,
  setSortField,
  artistFilter,
  setArtistFilter,
  artistOptions,
  getArtistName
}: BookingFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDateFilterCollapsible, setShowDateFilterCollapsible] = useState(false);

  const activeFiltersCount = [
    searchQuery !== "",
    statusFilter !== "all",
    startDate || endDate,
    artistFilter && artistFilter !== "all"
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Mobile Search - Always Visible */}
      <div className="block md:hidden w-full">
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center justify-between">
        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-sm">
          <SearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Filter Sheet */}
          <div className="block sm:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Filter Bookings</SheetTitle>
                  <SheetDescription>
                    Apply filters to find specific bookings
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <StatusFilter
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    statusOptions={statusOptions}
                  />
                  
                  {artistOptions && setArtistFilter && (
                    <ArtistFilter
                      artistFilter={artistFilter || "all"}
                      setArtistFilter={setArtistFilter}
                      artistOptions={artistOptions}
                    />
                  )}

                  <Collapsible open={showDateFilterCollapsible} onOpenChange={setShowDateFilterCollapsible}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date Filter
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      <DateFilter
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        showDateFilter={showDateFilter}
                        filterDateType={filterDateType}
                        setFilterDateType={setFilterDateType}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  <SortFilter
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    sortField={sortField}
                    setSortField={setSortField}
                  />

                  <ClearFiltersButton
                    startDate={startDate}
                    endDate={endDate}
                    statusFilter={statusFilter}
                    searchQuery={searchQuery}
                    artistFilter={artistFilter || "all"}
                    clearFilters={clearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filter Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <StatusFilter
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              statusOptions={statusOptions}
            />
            
            {artistOptions && setArtistFilter && (
              <ArtistFilter
                artistFilter={artistFilter || "all"}
                setArtistFilter={setArtistFilter}
                artistOptions={artistOptions}
              />
            )}

            <DateFilter
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              showDateFilter={showDateFilter}
              filterDateType={filterDateType}
              setFilterDateType={setFilterDateType}
            />

            <SortFilter
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              sortField={sortField}
              setSortField={setSortField}
            />

            <ClearFiltersButton
              startDate={startDate}
              endDate={endDate}
              statusFilter={statusFilter}
              searchQuery={searchQuery}
              artistFilter={artistFilter || "all"}
              clearFilters={clearFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;
