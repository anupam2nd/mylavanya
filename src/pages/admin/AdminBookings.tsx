
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EditBookingDialog from "@/components/admin/bookings/EditBookingDialog";
import NewJobDialog from "@/components/user/bookings/NewJobDialog";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import BookingHeader from "@/components/admin/bookings/BookingHeader";
import BookingSummary from "@/components/admin/bookings/BookingSummary";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { Booking } from "@/hooks/useBookings";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";
import { useArtistAssignment } from "@/hooks/useArtistAssignment";
import { useAdminBookingGroups } from "@/hooks/useAdminBookingGroups";
import BookingDetailsDialog from "@/components/admin/bookings/BookingDetailsDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { handleArtistAssignWithUser } = useArtistAssignment(bookings, () => {
    // This is a placeholder function
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

  // Use the new booking groups hook
  const { bookingGroups, primaryBookings } = useAdminBookingGroups(filteredBookings);

  // State for booking details dialog
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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

  // Function to open booking details
  const handleViewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin", "controller"]}>
      <DashboardLayout title="Manage Bookings">
        <Card>
          <BookingHeader 
            filteredBookings={primaryBookings}
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
            filteredBookingsCount={primaryBookings.length}
            totalBookingsCount={Object.keys(bookingGroups).length}
            sortField={sortField}
            sortDirection={sortDirection}
          />
          
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading bookings...
                      </TableCell>
                    </TableRow>
                  ) : primaryBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    primaryBookings.map((booking) => (
                      <TableRow key={booking.Booking_NO}>
                        <TableCell className="font-medium">{booking.Booking_NO}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.name}</div>
                            <div className="text-sm text-muted-foreground">{booking.email}</div>
                            <div className="text-sm text-muted-foreground">{booking.Phone_no}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{booking.Booking_date}</div>
                          <div className="text-sm text-muted-foreground">{booking.booking_time}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{(booking as any).serviceCount || 1}</span>
                            <span className="text-muted-foreground">service(s)</span>
                          </div>
                          {booking.ServiceName && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {booking.ServiceName}
                              {booking.SubService ? ` - ${booking.SubService}` : ''}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.Status || 'pending'} />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewBookingDetails(booking)}
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Booking Details Dialog */}
        {selectedBooking && (
          <BookingDetailsDialog
            isOpen={showBookingDetails}
            onClose={() => setShowBookingDetails(false)}
            booking={selectedBooking}
            relatedBookings={bookingGroups[selectedBooking.Booking_NO || ''] || []}
            onStatusChange={handleStatusChange}
            onArtistAssignment={handleArtistAssignmentWrapper}
            onScheduleChange={handleScheduleChangeWrapper}
            statusOptions={statusOptions}
            artists={artists}
          />
        )}

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
