
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminBookingsList from "@/components/user/bookings/AdminBookingsList";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { Booking } from "@/hooks/useBookings";
import { ExportButton } from "@/components/ui/export-button";

interface AdminBookingsViewProps {
  bookings: Booking[];
  loading: boolean;
  onEditClick: (booking: Booking) => void;
  onAddNewJob?: (booking: Booking) => void;
  isArtist?: boolean;
}

const AdminBookingsView = ({ 
  bookings, 
  loading, 
  onEditClick, 
  onAddNewJob,
  isArtist
}: AdminBookingsViewProps) => {
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
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
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
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No bookings found in the system.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredBookings.length} of {bookings.length} bookings
              {sortField && (
                <span className="ml-2">
                  sorted by {sortField === "creation_date" ? "creation date" : "booking date"} ({sortDirection === "desc" ? "newest first" : "oldest first"})
                </span>
              )}
            </div>
            <AdminBookingsList 
              bookings={filteredBookings} 
              loading={loading} 
              onEditClick={isArtist ? () => {} : onEditClick} 
              onAddNewJob={isArtist ? undefined : onAddNewJob}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminBookingsView;
