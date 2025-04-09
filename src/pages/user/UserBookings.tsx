
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import EditBookingDialog from "@/components/user/bookings/EditBookingDialog";
import NewJobDialog from "@/components/user/bookings/NewJobDialog";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { useBookingEdit } from "@/hooks/useBookingEdit";
import { useBookingArtists } from "@/hooks/useBookingArtists";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";
import { useUserBookings } from "@/hooks/useUserBookings";
import { useJobOperations } from "@/hooks/useJobOperations";
import { useArtistAssignment } from "@/hooks/useArtistAssignment";
import { BookingListHeader } from "@/components/user/bookings/BookingListHeader";
import { BookingListContent } from "@/components/user/bookings/BookingListContent";

const UserBookings = () => {
  const { user } = useAuth();
  
  // Fetch bookings using custom hook
  const { bookings, setBookings, loading } = useUserBookings();
  
  // Status and artist hooks
  const { statusOptions, formattedStatusOptions } = useStatusOptions();
  const { artists } = useBookingArtists();
  const { handleStatusChange } = useBookingStatusManagement();
  
  // Artist assignment hook
  const { currentUser, handleArtistAssignWithUser } = useArtistAssignment(bookings, setBookings);
  
  // Job operations hook
  const {
    showNewJobDialog,
    setShowNewJobDialog,
    selectedBookingForNewJob,
    handleAddNewJob,
    handleNewJobSuccess,
    handleDeleteJob,
    handleScheduleChange
  } = useJobOperations(bookings, setBookings);
  
  // Booking edit hook
  const {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveChanges
  } = useBookingEdit(bookings, setBookings);
  
  // Booking filters hook
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

  const isArtist = user?.role === 'artist';
  const isAdmin = user?.role === 'admin';

  return (
    <ProtectedRoute>
      <DashboardLayout title="Booking Management">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <BookingListHeader 
              filteredBookings={filteredBookings}
              bookings={bookings}
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
              bookingHeaders={bookingHeaders}
            />
          </CardHeader>
          <CardContent>
            <BookingListContent 
              loading={loading}
              bookings={bookings}
              filteredBookings={filteredBookings}
              handleEditClick={isArtist || !isAdmin ? () => {} : handleEditClick}
              handleAddNewJob={isArtist || !isAdmin ? undefined : handleAddNewJob}
              statusOptions={statusOptions}
              artists={artists}
              handleStatusChange={handleStatusChange}
              handleArtistAssignment={handleArtistAssignWithUser}
              isEditingDisabled={isArtist || !isAdmin}
              handleDeleteJob={isArtist || !isAdmin ? undefined : handleDeleteJob}
              handleScheduleChange={isArtist || !isAdmin ? undefined : handleScheduleChange}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          </CardContent>
        </Card>

        {isAdmin && !isArtist && (
          <>
            <EditBookingDialog
              booking={editBooking}
              open={openDialog}
              onOpenChange={setOpenDialog}
              onSave={async (booking, updates) => {
                const formValues = {
                  date: updates.Booking_date ? new Date(updates.Booking_date) : undefined,
                  time: updates.booking_time || "",
                  status: updates.Status || "",
                  service: updates.ServiceName || "",
                  subService: updates.SubService || "",
                  product: updates.ProductName || "",
                  quantity: updates.Qty || 1,
                  address: updates.Address || "",
                  pincode: updates.Pincode?.toString() || "",
                  artistId: updates.ArtistId || null,
                  currentUser
                };
                
                await handleSaveChanges(formValues);
              }}
              statusOptions={statusOptions}
              currentUser={currentUser}
            />
            
            <NewJobDialog
              open={showNewJobDialog}
              onOpenChange={setShowNewJobDialog}
              booking={selectedBookingForNewJob}
              onSuccess={handleNewJobSuccess}
              currentUser={currentUser}
            />
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UserBookings;
