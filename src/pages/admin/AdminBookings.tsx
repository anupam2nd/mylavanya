
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

const AdminBookings = () => {
  const { toast } = useToast();
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
    dateFilterType,
    setDateFilterType,
    clearFilters
  } = useBookingFilters(bookings);

  const {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveChanges
  } = useBookingEdit(bookings, setBookings);
  
  const handleArchive = async (booking: Booking) => {
    try {
      const { error } = await supabase
        .from('BookMST')
        .update({ Status: 'archived' })
        .eq('id', booking.id);
        
      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(b => 
        b.id === booking.id 
          ? { ...b, Status: 'archived' } 
          : b
      ));
      
      toast({
        title: "Booking archived",
        description: "The booking has been archived successfully",
      });
    } catch (error) {
      console.error('Error archiving booking:', error);
      toast({
        title: "Archive failed",
        description: "There was a problem archiving the booking",
        variant: "destructive"
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin", "user"]}>
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
              dateFilterType={dateFilterType}
              setDateFilterType={setDateFilterType}
            />
          </CardHeader>
          <CardContent>
            <BookingsTable
              filteredBookings={filteredBookings}
              handleEditClick={handleEditClick}
              handleArchive={handleArchive}
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
