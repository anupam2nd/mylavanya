
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import EditBookingDialog from "@/components/user/bookings/EditBookingDialog";
import { useBookings } from "@/hooks/useBookings";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { ExportButton } from "@/components/ui/export-button";
import AdminBookingsList from "@/components/user/bookings/AdminBookingsList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminBookings = () => {
  const { toast } = useToast();
  const { bookings, setBookings, loading } = useBookings();
  const { statusOptions } = useStatusOptions();
  const [currentUser, setCurrentUser] = useState<{ Username?: string } | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  
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

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: authSession } = await supabase.auth.getSession();
        
        if (authSession?.session?.user?.id) {
          const { data, error } = await supabase
            .from('UserMST')
            .select('Username, FirstName, LastName')
            .eq('id', authSession.session.user.id)
            .single();
            
          if (!error && data) {
            setCurrentUser(data);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const handleEditClick = (booking: Booking) => {
    setEditBooking(booking);
    setOpenDialog(true);
  };

  const handleSaveChanges = async (booking: Booking, updates: Partial<Booking>) => {
    try {
      const { error } = await supabase
        .from('BookMST')
        .update(updates)
        .eq('id', booking.id);

      if (error) throw error;

      // Update the bookings state with the edited booking
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, ...updates } : b
      ));

      toast({
        title: "Booking updated",
        description: "The booking has been successfully updated",
      });

      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the booking",
        variant: "destructive"
      });
    }
  };

  // CSV export headers for better readability
  const bookingHeaders = {
    id: 'ID',
    Booking_NO: 'Booking Number',
    jobno: 'Job Number',
    Booking_date: 'Booking Date',
    booking_time: 'Booking Time',
    name: 'Customer Name',
    email: 'Email',
    Phone_no: 'Phone Number',
    Address: 'Address',
    Pincode: 'Pin Code',
    Purpose: 'Purpose',
    ServiceName: 'Service',
    SubService: 'Sub Service',
    ProductName: 'Product',
    price: 'Price',
    Qty: 'Quantity',
    Status: 'Status',
    Assignedto: 'Assigned To',
    created_at: 'Created At'
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
            />
          </CardContent>
        </Card>

        <EditBookingDialog
          booking={editBooking}
          open={openDialog}
          onOpenChange={setOpenDialog}
          onSave={handleSaveChanges}
          statusOptions={statusOptions}
          currentUser={currentUser}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminBookings;
