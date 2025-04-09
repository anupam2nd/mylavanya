
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButton } from "@/components/ui/export-button";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import { Booking } from "@/hooks/useBookings";
import { FilterDateType, SortDirection, SortField } from "@/hooks/useBookingFilters";

interface BookingHeaderProps {
  filteredBookings: Booking[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  clearFilters: () => void;
  formattedStatusOptions: { value: string; label: string }[];
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  filterDateType: FilterDateType;
  setFilterDateType: (type: FilterDateType) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
}

// Headers for export
const bookingHeaders = {
  id: 'ID',
  Booking_NO: 'Booking Number',
  jobno: 'Job Number',
  Booking_date: 'Booking Date',
  booking_time: 'Booking Time',
  name: 'Customer Name',
  email: 'Email',
  Phone_no: 'Phone Number',
  Address: 'Address',
  Pincode: 'Pin Code',
  Purpose: 'Purpose',
  ServiceName: 'Service',
  SubService: 'Sub Service',
  ProductName: 'Product',
  price: 'Price',
  Qty: 'Quantity',
  Status: 'Status',
  Assignedto: 'Assigned To',
  created_at: 'Created At'
};

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  filteredBookings,
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
  setSortField
}) => {
  return (
    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <CardTitle>Booking Management</CardTitle>
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
    </CardHeader>
  );
};

export default BookingHeader;
