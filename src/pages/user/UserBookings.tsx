
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
import BookingListContent from "@/components/user/bookings/BookingListContent";
import { BookingNotifications } from "@/components/user/bookings/BookingNotifications";

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
  
  // Booking filters hook - simplified to only include status and date filters
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

  // Determine if the current user is allowed to edit bookings (admin, superadmin, controller, or user from UserMST)
  const canEdit = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'controller' || user?.role === 'user';
  const isMember = user?.role === 'member';
  
  // Set the title based on user role
  const pageTitle = isMember ? "Your Bookings" : "Booking Management";

  return (
    <ProtectedRoute>
      <DashboardLayout title={pageTitle}>
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <BookingListHeader 
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
            />
          </CardHeader>
          <CardContent>
            {isMember && <BookingNotifications />}
            
            <BookingListContent 
              loading={loading}
              bookings={bookings}
              filteredBookings={filteredBookings}
              handleEditClick={canEdit ? handleEditClick : () => {}}
              handleAddNewJob={canEdit ? handleAddNewJob : undefined}
              statusOptions={statusOptions}
              artists={artists}
              handleStatusChange={handleStatusChange}
              handleArtistAssignment={handleArtistAssignWithUser}
              isEditingDisabled={!canEdit}
              handleDeleteJob={canEdit ? handleDeleteJob : undefined}
              handleScheduleChange={canEdit ? handleScheduleChange : undefined}
              sortField="created_at"
              sortDirection="desc"
            />
          </CardContent>
        </Card>

        {canEdit && (
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
