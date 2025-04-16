
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EditBookingDialog from "@/components/admin/bookings/EditBookingDialog";
import NewJobDialog from "@/components/user/bookings/NewJobDialog";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import AdminBookingsList from "@/components/user/bookings/AdminBookingsList";
import BookingHeader from "@/components/admin/bookings/BookingHeader";
import BookingSummary from "@/components/admin/bookings/BookingSummary";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { Booking } from "@/hooks/useBookings";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";
import { useArtistAssignment } from "@/hooks/useArtistAssignment";

const AdminBookings = () => {
  const { statusOptions, formattedStatusOptions } = useStatusOptions();
  const { 
    bookings, 
    loading, 
    currentUser,
    artists,
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveWithUserData,
    handleDeleteJob,
    handleScheduleChange,
    handleAddNewJob,
    showNewJobDialog,
    setShowNewJobDialog,
    selectedBookingForNewJob,
    handleNewJobSuccess
  } = useAdminBookings();
  
  // Import these from the appropriate hooks
  const { handleStatusChange } = useBookingStatusManagement();
  const { handleArtistAssignWithUser } = useArtistAssignment(bookings, setBookings => {
    // This is a placeholder function to pass to useArtistAssignment.
    // The actual setBookings is handled in useAdminBookings
  });
  
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

  // Add these wrapper functions with proper Promise<void> return types
  const handleArtistAssignmentWrapper = async (booking: Booking, artistId: string): Promise<void> => {
    return handleArtistAssignWithUser(booking, artistId);
  };

  const handleDeleteJobWrapper = async (booking: Booking): Promise<void> => {
    return handleDeleteJob(booking);
  };

  const handleScheduleChangeWrapper = async (booking: Booking, date: string, time: string): Promise<void> => {
    return handleScheduleChange(booking, date, time);
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin", "controller"]}>
      <DashboardLayout title="Manage Bookings">
        <Card>
          <BookingHeader 
            filteredBookings={filteredBookings}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            clearFilters={clearFilters}
            formattedStatusOptions={formattedStatusOptions}
            showDateFilter={showDateFilter}
            setShowDateFilter={setShowDateFilter}
            filterDateType={filterDateType}
            setFilterDateType={setFilterDateType}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            sortField={sortField}
            setSortField={setSortField}
          />
          
          <BookingSummary 
            filteredBookingsCount={filteredBookings.length}
            totalBookingsCount={bookings.length}
            sortField={sortField}
            sortDirection={sortDirection}
          />
          
          <CardContent>
            <AdminBookingsList
              bookings={filteredBookings}
              loading={loading}
              onEditClick={handleEditClick}
              onAddNewJob={handleAddNewJob}
              statusOptions={statusOptions}
              artists={artists}
              handleStatusChange={handleStatusChange}
              handleArtistAssignment={handleArtistAssignmentWrapper}
              onDeleteJob={handleDeleteJobWrapper}
              onScheduleChange={handleScheduleChangeWrapper}
            />
          </CardContent>
        </Card>

        <EditBookingDialog
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          editBooking={editBooking}
          handleSaveChanges={handleSaveWithUserData}
          statusOptions={statusOptions}
        />
        
        <NewJobDialog
          open={showNewJobDialog}
          onOpenChange={setShowNewJobDialog}
          booking={selectedBookingForNewJob}
          onSuccess={handleNewJobSuccess}
          currentUser={currentUser}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminBookings;
