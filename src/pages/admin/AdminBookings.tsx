
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import BookingsTable from "@/components/admin/bookings/BookingsTable";
import EditBookingDialog from "@/components/admin/bookings/EditBookingDialog";
import { useBookings } from "@/hooks/useBookings";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { useBookingEdit } from "@/hooks/useBookingEdit";
import { ExportButton } from "@/components/ui/export-button";
import AdminBookingsList from "@/components/user/bookings/AdminBookingsList";

const AdminBookings = () => {
  const { bookings, setBookings, loading } = useBookings();
  const { statusOptions } = useStatusOptions();
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
    clearFilters
  } = useBookingFilters(bookings);

  const {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveChanges
  } = useBookingEdit(bookings, setBookings);

  // CSV export headers for better readability
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

  const handleFilterButtonClick = () => {
    setShowDateFilter(true);
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Manage Bookings">
        <Card>
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
                statusOptions={statusOptions}
                showDateFilter={showDateFilter}
                setShowDateFilter={setShowDateFilter}
                filterDateType={filterDateType}
                setFilterDateType={setFilterDateType}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
            <AdminBookingsList
              bookings={filteredBookings}
              loading={loading}
              onEditClick={handleEditClick}
              onFilterClick={handleFilterButtonClick}
            />
          </CardContent>
        </Card>

        <EditBookingDialog
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          editBooking={editBooking}
          handleSaveChanges={handleSaveChanges}
          statusOptions={statusOptions}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminBookings;
