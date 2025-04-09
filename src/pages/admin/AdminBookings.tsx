
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
    handleStatusChange,
    handleArtistAssignWithUser,
    handleDeleteJob,
    handleScheduleChange,
    handleAddNewJob,
    showNewJobDialog,
    setShowNewJobDialog,
    selectedBookingForNewJob,
    handleNewJobSuccess
  } = useAdminBookings();
  
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

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
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
              handleArtistAssignment={handleArtistAssignWithUser}
              onDeleteJob={handleDeleteJob}
              onScheduleChange={handleScheduleChange}
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
