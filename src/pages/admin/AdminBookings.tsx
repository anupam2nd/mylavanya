
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import EditBookingDialog from "@/components/admin/bookings/EditBookingDialog";
import NewJobDialog from "@/components/user/bookings/NewJobDialog";
import { useBookings } from "@/hooks/useBookings";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { ExportButton } from "@/components/ui/export-button";
import AdminBookingsList from "@/components/user/bookings/AdminBookingsList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBookingEdit } from "@/hooks/useBookingEdit";
import { useAuth } from "@/context/AuthContext";
import { useBookingArtists } from "@/hooks/useBookingArtists";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";

import type { Booking } from "@/hooks/useBookings";

const AdminBookings = () => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { bookings, setBookings, loading } = useBookings();
  const { statusOptions, formattedStatusOptions } = useStatusOptions();
  const { artists } = useBookingArtists();
  const { handleStatusChange, handleArtistAssignment } = useBookingStatusManagement();
  
  const [currentUser, setCurrentUser] = useState<{ Username?: string, FirstName?: string, LastName?: string, role?: string } | null>(null);
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);
  
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

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: authSession } = await supabase.auth.getSession();
        
        if (authSession?.session?.user?.id) {
          const userId = parseInt(authSession.session.user.id, 10);
          
          if (!isNaN(userId)) {
            const { data, error } = await supabase
              .from('UserMST')
              .select('Username, FirstName, LastName, role')
              .eq('id', userId)
              .single();
              
            if (!error && data) {
              console.log("Current user data fetched:", data);
              setCurrentUser(data);
            } else {
              console.error("Error fetching user data:", error);
              if (authUser) {
                setCurrentUser({
                  Username: authUser.email?.split('@')[0] || '',
                  FirstName: '',
                  LastName: '',
                  role: authUser.role
                });
              }
            }
          } else {
            console.error("Invalid user ID format:", authSession.session.user.id);
          }
        } else {
          console.warn("No active session found");
        }
      } catch (error) {
        console.error('Error in fetchCurrentUser:', error);
      }
    };
    
    fetchCurrentUser();
  }, [authUser]);

  const handleAddNewJob = (booking: Booking) => {
    setSelectedBookingForNewJob(booking);
    setShowNewJobDialog(true);
  };

  const handleNewJobSuccess = (newBooking: Booking) => {
    setBookings([newBooking, ...bookings]);
    setShowNewJobDialog(false);
    
    toast({
      title: "Success!",
      description: "New job has been added to this booking",
    });
  };

  const handleSaveWithUserData = (values: any) => {
    console.log("Saving changes with current user:", currentUser);
    
    if (!currentUser) {
      console.warn("No current user data available for booking update");
    }
    
    handleSaveChanges({
      ...values,
      currentUser
    });
  };

  const handleArtistAssignWithUser = async (booking: Booking, artistId: number) => {
    await handleArtistAssignment(booking, artistId, artists);
    
    // Refresh bookings after assignment
    const bookingIndex = bookings.findIndex(b => b.id === booking.id);
    if (bookingIndex !== -1) {
      const updatedBooking = {
        ...booking,
        ArtistId: artistId,
        Assignedto: artists.find(a => a.ArtistId === artistId)?.ArtistFirstName || 'Artist',
        AssignedBY: currentUser?.FirstName || currentUser?.Username || 'Admin',
        AssingnedON: new Date().toISOString()
      };
      
      const updatedBookings = [...bookings];
      updatedBookings[bookingIndex] = updatedBooking;
      setBookings(updatedBookings);
    }
  };

  // New function to handle job deletion
  const handleDeleteJob = async (booking: Booking) => {
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

  // New function to handle schedule changes
  const handleScheduleChange = async (booking: Booking, date: string, time: string) => {
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
              onAddNewJob={handleAddNewJob}
              statusOptions={statusOptions}
              artists={artists}
              handleStatusChange={handleStatusChange}
              handleArtistAssignment={handleArtistAssignWithUser}
              onDeleteJob={handleDeleteJob}
              onScheduleChange={handleScheduleChange}
            />
          </CardContent>
        </Card>

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
