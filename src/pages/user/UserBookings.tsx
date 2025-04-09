
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import BookingsList from "@/components/user/bookings/BookingsList";
import AdminBookingsList from "@/components/user/bookings/AdminBookingsList";
import EditBookingDialog from "@/components/user/bookings/EditBookingDialog";
import NewJobDialog from "@/components/user/bookings/NewJobDialog";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { Booking } from "@/hooks/useBookings";
import { ExportButton } from "@/components/ui/export-button";
import { useBookingEdit } from "@/hooks/useBookingEdit";
import { useBookingArtists } from "@/hooks/useBookingArtists";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";

const UserBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ Username?: string, FirstName?: string, LastName?: string } | null>(null);
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);
  
  const { statusOptions, formattedStatusOptions } = useStatusOptions();
  const { artists } = useBookingArtists();
  const { handleStatusChange, handleArtistAssignment } = useBookingStatusManagement();
  
  const {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveChanges
  } = useBookingEdit(bookings, setBookings);
  
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

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      setLoading(true);
      try {
        let query = supabase
          .from('BookMST')
          .select('*')
          .order('Booking_date', { ascending: false });
        
        if (user?.role === 'artist') {
          const artistId = parseInt(user.id, 10);
          if (!isNaN(artistId)) {
            console.log("Filtering bookings by artist ID:", artistId);
            query = query.eq('ArtistId', artistId);
          }
        } 
        else if (user?.role === 'member') {
          console.log("Filtering bookings by member email:", user.email);
          query = query.eq('email', user.email);
        }
        else if (user?.role === 'admin') {
          console.log("Showing all bookings for admin");
        }
        
        query = query.order('Booking_date', { ascending: false });
        
        const { data, error } = await query;

        if (error) throw error;
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
  }, [toast, user]);

  const handleAddNewJob = (booking: Booking) => {
    setSelectedBookingForNewJob(booking);
    setShowNewJobDialog(true);
  };

  const handleNewJobSuccess = (newBooking: Booking) => {
    setBookings(prevBookings => [newBooking, ...prevBookings]);
    setShowNewJobDialog(false);
    
    toast({
      title: "Success!",
      description: "New job has been added to this booking",
    });
  };

  const handleArtistAssignWithUser = async (booking: Booking, artistId: number) => {
    await handleArtistAssignment(booking, artistId, artists);
    
    const bookingIndex = bookings.findIndex(b => b.id === booking.id);
    if (bookingIndex !== -1) {
      const updatedBooking = {
        ...booking,
        ArtistId: artistId,
        Assignedto: artists.find(a => a.ArtistId === artistId)?.ArtistFirstName || 'Artist',
        AssignedBY: currentUser?.FirstName || currentUser?.Username || 'User',
        AssingnedON: new Date().toISOString()
      };
      
      const updatedBookings = [...bookings];
      updatedBookings[bookingIndex] = updatedBooking;
      setBookings(updatedBookings);
    }
  };

  // New function to handle job deletion (admin only)
  const handleDeleteJob = async (booking: Booking) => {
    if (user?.role !== 'admin') return;
    
    try {
      const { error } = await supabase
        .from('BookMST')
        .delete()
        .eq('id', booking.id);

      if (error) {
        throw error;
      }

      // Update local state
      setBookings(bookings.filter(b => b.id !== booking.id));
      
      toast({
        title: "Job deleted",
        description: `Job #${booking.jobno} has been deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error deleting job",
        description: "An error occurred while trying to delete the job",
      });
    }
  };

  // New function to handle schedule changes (admin only)
  const handleScheduleChange = async (booking: Booking, date: string, time: string) => {
    if (user?.role !== 'admin') return;
    
    try {
      const { error } = await supabase
        .from('BookMST')
        .update({
          Booking_date: date,
          booking_time: time
        })
        .eq('id', booking.id);

      if (error) {
        throw error;
      }

      // Update local state
      const bookingIndex = bookings.findIndex(b => b.id === booking.id);
      if (bookingIndex !== -1) {
        const updatedBooking = {
          ...booking,
          Booking_date: date,
          booking_time: time
        };
        
        const updatedBookings = [...bookings];
        updatedBookings[bookingIndex] = updatedBooking;
        setBookings(updatedBookings);
      }
      
      toast({
        title: "Schedule updated",
        description: `Booking schedule has been updated to ${date} at ${time}`,
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        variant: "destructive",
        title: "Error updating schedule",
        description: "An error occurred while trying to update the schedule",
      });
    }
  };

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
            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No bookings found in the system.</p>
              </div>
            ) : (
              <>
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
                  onEditClick={isArtist || !isAdmin ? () => {} : handleEditClick} 
                  onAddNewJob={isArtist || !isAdmin ? undefined : handleAddNewJob}
                  statusOptions={statusOptions}
                  artists={artists}
                  handleStatusChange={handleStatusChange}
                  handleArtistAssignment={handleArtistAssignWithUser}
                  isEditingDisabled={isArtist || !isAdmin}
                  onDeleteJob={isArtist || !isAdmin ? undefined : handleDeleteJob}
                  onScheduleChange={isArtist || !isAdmin ? undefined : handleScheduleChange}
                />
              </>
            )}
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
