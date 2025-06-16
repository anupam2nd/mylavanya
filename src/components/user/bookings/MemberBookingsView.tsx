
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookingsList from "@/components/user/bookings/BookingsList";
import { Booking } from "@/hooks/useBookings";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import { ExportButton } from "@/components/ui/export-button";

interface MemberBookingsViewProps {
  bookings: Booking[];
  loading: boolean;
}

const MemberBookingsView = ({ bookings, loading }: MemberBookingsViewProps) => {
  const { statusOptions, formattedStatusOptions } = useStatusOptions();
  
  const {
    filteredBookings,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    showDateFilter,
    setShowDateFilter,
    filterDateType,
    setFilterDateType,
    sortDirection,
    setSortDirection,
    sortField,
    setSortField,
    clearFilters
  } = useBookingFilters(bookings);

  const bookingHeaders = {
    id: 'ID',
    Booking_NO: 'Booking Number',
    Booking_date: 'Booking Date',
    booking_time: 'Booking Time',
    name: 'Customer Name',
    email: 'Email',
    Phone_no: 'Phone Number',
    Address: 'Address',
    Pincode: 'Pin Code',
    Purpose: 'Purpose',
    Product: 'Product ID',
    price: 'Price',
    Qty: 'Quantity',
    Status: 'Status',
    created_at: 'Created At'
  };

  return (
    <Card className="shadow-sm hover:shadow transition-shadow w-full">
      <CardHeader className="px-3 py-4 sm:px-6 sm:py-6 border-b bg-card">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <CardTitle className="text-lg sm:text-xl">My Bookings</CardTitle>
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
            <div className="w-full sm:w-auto">
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
            <ExportButton
              data={filteredBookings}
              filename="my_bookings"
              headers={bookingHeaders}
              buttonText="Export"
              className="w-full sm:w-auto text-xs sm:text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">No bookings found in the system.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span>Showing {filteredBookings.length} of {bookings.length} bookings</span>
                {sortField && (
                  <span className="text-xs">
                    sorted by {sortField === "creation_date" ? "creation date" : "booking date"} ({sortDirection === "desc" ? "newest first" : "oldest first"})
                  </span>
                )}
              </div>
            </div>
            <div className="overflow-hidden">
              <BookingsList 
                filteredBookings={filteredBookings} 
                clearFilters={clearFilters}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberBookingsView;
