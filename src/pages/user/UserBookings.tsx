
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import BookingsList from "@/components/user/bookings/BookingsList";
import EditBookingDialog from "@/components/user/bookings/EditBookingDialog";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { Booking } from "@/hooks/useBookings";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ExportButton } from "@/components/ui/export-button";

const UserBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Get status options for the filter
  const { statusOptions } = useStatusOptions();
  
  // Use the same filter hook used in admin panel
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

  // Fetch all bookings instead of just the user's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        console.log("Fetching all bookings for coordinator");
        const { data, error } = await supabase
          .from('BookMST')
          .select('*')
          .order('Booking_date', { ascending: false });

        if (error) {
          console.error('Error fetching bookings:', error);
          throw error;
        }
        
        console.log("Bookings fetched:", data?.length || 0);
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Failed to load bookings",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

  const handleEditClick = (booking: Booking) => {
    setEditBooking(booking);
    setOpenDialog(true);
  };

  const handleSaveChanges = async (updates: Partial<Booking>) => {
    if (!editBooking) return;

    try {
      const { error } = await supabase
        .from('BookMST')
        .update(updates)
        .eq('id', editBooking.id);

      if (error) throw error;

      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === editBooking.id 
          ? { ...booking, ...updates } 
          : booking
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

  return (
    <ProtectedRoute>
      <DashboardLayout title="Booking Management">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>All Bookings</CardTitle>
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
            {loading ? (
              <div className="p-8 flex justify-center items-center">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No bookings found in the system.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredBookings.length} of {bookings.length} bookings
                </div>
                <BookingsList 
                  bookings={filteredBookings} 
                  loading={loading} 
                  onEditClick={handleEditClick} 
                />
              </>
            )}
          </CardContent>
        </Card>

        <EditBookingDialog
          booking={editBooking}
          open={openDialog}
          onOpenChange={setOpenDialog}
          onSave={handleSaveChanges}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UserBookings;
