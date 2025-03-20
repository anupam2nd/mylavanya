import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import BookingsTable from "@/components/admin/bookings/BookingsTable";
import EditBookingDialog from "@/components/admin/bookings/EditBookingDialog";
import { EditBookingFormValues } from "@/components/admin/bookings/EditBookingFormSchema";

interface Booking {
  id: number;
  Booking_NO: string;
  name: string;
  email: string;
  Phone_no: number;
  Booking_date: string;
  booking_time: string;
  Purpose: string;
  Status: string;
  price: number;
  Address?: string;
  Pincode?: number;
}

const AdminBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusOptions, setStatusOptions] = useState<{status_code: string; status_name: string}[]>([]);
  
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name');

        if (error) throw error;
        setStatusOptions(data || []);
      } catch (error) {
        console.error('Error fetching status options:', error);
      }
    };

    fetchStatusOptions();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('BookMST')
          .select('*')
          .order('Booking_date', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
        setFilteredBookings(data || []);
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

  useEffect(() => {
    let result = [...bookings];
    
    if (startDate && endDate) {
      result = result.filter(booking => {
        const bookingDate = new Date(booking.Booking_date);
        return (
          isAfter(bookingDate, startOfDay(startDate)) && 
          isBefore(bookingDate, endOfDay(endDate))
        );
      });
    }
    
    if (statusFilter) {
      result = result.filter(booking => booking.Status === statusFilter);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => 
        (booking.Booking_NO && booking.Booking_NO.toLowerCase().includes(query)) ||
        (booking.name && booking.name.toLowerCase().includes(query)) ||
        (booking.email && booking.email.toLowerCase().includes(query)) ||
        (booking.Purpose && booking.Purpose.toLowerCase().includes(query))
      );
    }
    
    setFilteredBookings(result);
  }, [bookings, startDate, endDate, statusFilter, searchQuery]);

  const handleEditClick = (booking: Booking) => {
    setEditBooking(booking);
    setOpenDialog(true);
  };

  const handleSaveChanges = async (values: EditBookingFormValues) => {
    if (!editBooking) return;

    try {
      const updates = {
        Booking_date: values.date ? format(values.date, 'yyyy-MM-dd') : editBooking.Booking_date,
        booking_time: values.time,
        Status: values.status
      };

      const { error } = await supabase
        .from('BookMST')
        .update(updates)
        .eq('id', editBooking.id);

      if (error) throw error;

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

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter("");
    setSearchQuery("");
    setFilteredBookings(bookings);
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
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
            />
          </CardHeader>
          <CardContent>
            <BookingsTable
              filteredBookings={filteredBookings}
              handleEditClick={handleEditClick}
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
