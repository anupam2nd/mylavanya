
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

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        console.log("Fetching bookings for user:", user.email);
        const { data, error } = await supabase
          .from('BookMST')
          .select('*')
          .eq('email', user.email)
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
  }, [user, toast]);

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
        description: "Your booking has been successfully updated",
      });

      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your booking",
        variant: "destructive"
      });
    }
  };

  // Render an empty state with a button to create a new booking
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-slate-50 rounded-full p-4 mb-4">
        <PlusCircle className="h-12 w-12 text-slate-300" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
      <p className="text-slate-500 mb-6 max-w-md">
        You haven't made any bookings yet. Book a service to see your appointments here.
      </p>
      <Link to="/services">
        <Button size="lg" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Book a Service
        </Button>
      </Link>
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout title="My Bookings">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Your Bookings</CardTitle>
            {bookings.length > 0 && (
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
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 flex justify-center items-center">Loading...</div>
            ) : bookings.length === 0 ? (
              <EmptyState />
            ) : (
              <BookingsList 
                bookings={filteredBookings} 
                loading={loading} 
                onEditClick={handleEditClick} 
              />
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
