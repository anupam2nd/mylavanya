
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
    clearFilters
  } = useBookingFilters(bookings);

  const {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveChanges
  } = useBookingEdit(bookings, setBookings);

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Manage Bookings">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Booking Management</CardTitle>
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
            />
          </CardHeader>
          <CardContent>
            <BookingsTable
              filteredBookings={filteredBookings}
              handleEditClick={handleEditClick}
              loading={loading}
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
