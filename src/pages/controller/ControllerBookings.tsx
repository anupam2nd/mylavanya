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
import { Navigate } from "react-router-dom";

import type { Booking } from "@/hooks/useBookings";

const ControllerBookings = () => {
  const { toast } = useToast();
  const { user, user: authUser } = useAuth();
  const { bookings, setBookings, loading } = useBookings();
  const { statusOptions, formattedStatusOptions } = useStatusOptions();
  const [currentUser, setCurrentUser] = useState<{ Username?: string, FirstName?: string, LastName?: string, role?: string } | null>(null);
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);
  
  useEffect(() => {
    console.log("Controller Bookings rendered with direct implementation");
  }, []);
  
  // If user is not a controller, redirect to appropriate dashboard
  if (!user || user.role !== 'controller') {
    return <Navigate to="/" />;
  }
  
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
    clearFilters,
    artistFilter,
    setArtistFilter,
    artistOptions
  } = useBookingFilters(bookings);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (authUser && authUser.email) {
          // First try to fetch by email from auth context
          const { data, error } = await supabase
            .from('UserMST')
            .select('Username, FirstName, LastName, role')
            .eq('Username', authUser.email)
            .single();
            
          if (!error && data) {
            console.log("Current user data fetched by email:", data);
            setCurrentUser(data);
            return;
          }
          
          // If that fails, try by ID if available
          const { data: authSession } = await supabase.auth.getSession();
          
          if (authSession?.session?.user?.id) {
            const userId = parseInt(authSession.session.user.id, 10);
            
            if (!isNaN(userId)) {
              const { data: userData, error: userError } = await supabase
                .from('UserMST')
                .select('Username, FirstName, LastName, role')
                .eq('id', userId)
                .single();
                
              if (!userError && userData) {
                console.log("Current user data fetched by ID:", userData);
                setCurrentUser(userData);
              } else {
                console.error("Error fetching user data by ID:", userError);
                if (authUser) {
                  setCurrentUser({
                    Username: authUser.email || '',
                    FirstName: '',
                    LastName: '',
                    role: authUser.role
                  });
                }
              }
            }
          } else {
            console.warn("No active session found");
            if (authUser) {
              setCurrentUser({
                Username: authUser.email || '',
                FirstName: '',
                LastName: '',
                role: authUser.role
              });
            }
          }
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
    <ProtectedRoute allowedRoles={['controller']}>
      <DashboardLayout title="Manage Bookings">
        <Card>
          <CardHeader className="flex flex-col space-y-2">
            <CardTitle>Booking Management</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
              <ExportButton
                data={filteredBookings}
                filename="bookings"
                headers={bookingHeaders}
                buttonText="Export"
                className="w-full sm:w-auto"
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
                artistFilter={artistFilter}
                setArtistFilter={setArtistFilter}
                artistOptions={artistOptions}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredBookings.length} of {bookings.length} bookings
              {sortField && (
                <span className="ml-2 block sm:inline">
                  sorted by {sortField === "creation_date" ? "creation date" : "booking date"} ({sortDirection === "desc" ? "newest first" : "oldest first"})
                </span>
              )}
              {artistFilter !== "all" && (
                <span className="ml-2">
                  • Filtered by artist
                </span>
              )}
            </div>
            <AdminBookingsList
              bookings={filteredBookings}
              loading={loading}
              onEditClick={handleEditClick}
              onAddNewJob={handleAddNewJob}
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

export default ControllerBookings;
