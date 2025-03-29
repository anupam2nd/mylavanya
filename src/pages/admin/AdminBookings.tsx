
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import EditBookingDialog from "@/components/admin/bookings/EditBookingDialog";
import { useBookings, Booking } from "@/hooks/useBookings";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { ExportButton } from "@/components/ui/export-button";
import AdminBookingsList from "@/components/user/bookings/AdminBookingsList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminBookings = () => {
  const { toast } = useToast();
  const { bookings, setBookings, loading } = useBookings();
  const { statusOptions, formattedStatusOptions } = useStatusOptions();
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
    sortDirection,
    setSortDirection,
    sortField,
    setSortField,
    clearFilters
  } = useBookingFilters(bookings);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: authSession } = await supabase.auth.getSession();
        
        if (authSession?.session?.user?.id) {
          const userId = parseInt(authSession.session.user.id, 10);
          
          if (!isNaN(userId)) {
            const { data, error } = await supabase
              .from('UserMST')
              .select('Username, FirstName, LastName')
              .eq('id', userId)
              .single();
              
            if (!error && data) {
              setCurrentUser(data);
            }
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
      // Filter out any fields that don't exist in the BookMST table
      // based on the error we're seeing with prod_id
      const validUpdates = { ...updates };
      if ('prod_id' in validUpdates) {
        delete validUpdates.prod_id;
      }
      
      console.log("Updating booking with filtered updates:", validUpdates);

      const { error } = await supabase
        .from('BookMST')
        .update(validUpdates)
        .eq('id', booking.id);

      if (error) {
        console.error('Error updating booking:', error);
        throw error;
      }

      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, ...validUpdates } : b
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
