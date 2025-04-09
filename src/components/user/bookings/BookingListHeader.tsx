
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { ExportButton } from "@/components/ui/export-button";
import BookingFilters from "@/components/admin/bookings/BookingFilters";

interface BookingListHeaderProps {
  filteredBookings: any[];
  bookings: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  clearFilters: () => void;
  formattedStatusOptions: any[];
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  filterDateType: string;
  setFilterDateType: (type: any) => void;
  sortDirection: string;
  setSortDirection: (direction: any) => void;
  sortField: string;
  setSortField: (field: any) => void;
  bookingHeaders: Record<string, string>;
}

export const BookingListHeader: React.FC<BookingListHeaderProps> = ({
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
}) => {
  return (
    <>
      <CardTitle>All Bookings</CardTitle>
      <div className="flex items-center space-x-2">
        <ExportButton
          data={filteredBookings}
          filename="bookings"
          headers={bookingHeaders}
          buttonText="Export Bookings"
        />
        <BookingFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          clearFilters={clearFilters}
          statusOptions={formattedStatusOptions}
          showDateFilter={showDateFilter}
          setShowDateFilter={setShowDateFilter}
          filterDateType={filterDateType}
          setFilterDateType={setFilterDateType}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          sortField={sortField}
          setSortField={setSortField}
        />
      </div>
    </>
  );
};
