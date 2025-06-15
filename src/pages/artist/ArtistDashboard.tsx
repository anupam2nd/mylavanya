import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { parseISO, format } from "date-fns";
import { Calendar, Clock, MapPin, Plus, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import NewJobDialog from "@/components/artist/NewJobDialog";
import AddServiceDialog from "@/components/artist/AddServiceDialog";
import ArtistBookingCard from "@/components/artist/ArtistBookingCard";

const ArtistDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [completedServicesCount, setCompletedServicesCount] = useState<number>(0);
  const [artistDetails, setArtistDetails] = useState<{
    firstName: string;
    lastName: string;
  }>({
    firstName: '',
    lastName: ''
  });

  // State for the add service dialog
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    id: number;
    bookingNo: string;
    customerPhone: string;
    customerName: string;
    customerEmail: string;
  } | null>(null);
  
  // Fetch artist details
  useEffect(() => {
    const fetchArtistDetails = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistFirstName, ArtistLastName')
          .eq('ArtistId', parseInt(user.id, 10))
          .single();
        
        if (error) {
          console.error("Error fetching artist details:", error);
          return;
        }
        
        if (data) {
          setArtistDetails({
            firstName: data.ArtistFirstName || '',
            lastName: data.ArtistLastName || ''
          });
        }
      } catch (error) {
        console.error("Unexpected error fetching artist details:", error);
      }
    };
    
    fetchArtistDetails();
  }, [user]);
  
  // Calculate total earnings and completed services count from completed services
  const calculateStats = (bookingsData: any[]) => {
    // Fix: Consider all status variants that indicate completion (case-insensitive)
    const completedStatuses = ['done', 'completed', 'DONE', 'COMPLETED'];
    const completedBookings = bookingsData.filter(booking => 
      booking.Status && completedStatuses.includes(booking.Status.toLowerCase())
    );
    
    // Set the count of completed services
    setCompletedServicesCount(completedBookings.length);
    
    // Fix: Calculate earnings from completed services with proper type handling
    const earnings = completedBookings.reduce((sum, booking) => {
      // Handle different price formats (string, number, null)
      const price = typeof booking.price === 'number' ? booking.price :
                   (typeof booking.price === 'string' ? parseFloat(booking.price) : 0);
      
      return sum + price;
    }, 0);
    
    setTotalEarnings(earnings);
  };
  
  // Fetch bookings
  const fetchArtistBookings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching bookings for artist ID:", user.id);
      
      // Convert string ID to number for the query
      const artistId = parseInt(user.id, 10);
      
      // Make sure we have a valid number before querying
      if (isNaN(artistId)) {
        console.error("Invalid artist ID:", user.id);
        toast.error("Could not load bookings: invalid artist ID");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('BookMST')
        .select('*')
        .eq('ArtistId', artistId)
        .not('Status', 'in', '("pending","cancelled","Pending","Cancelled","P","C")')
        .order('Booking_date', { ascending: false });
      
      if (error) {
        console.error("Error fetching artist bookings:", error);
        toast.error("Failed to load your assigned bookings");
        return;
      }
      
      console.log("Artist bookings:", data);
      setBookings(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Unexpected error fetching artist bookings:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtistBookings();
  }, [user]);

  const handleAddNewService = (booking: any) => {
    setSelectedBooking({
      id: booking.id,
      bookingNo: booking.Booking_NO.toString(),
      customerPhone: booking.Phone_no ? booking.Phone_no.toString() : '',
      customerName: booking.name,
      customerEmail: booking.email || ''
    });
    setIsAddServiceDialogOpen(true);
  };

  // Group bookings by Booking_NO to organize them better
  const groupedBookings = bookings.reduce((acc: Record<string, any[]>, booking) => {
    const bookingNo = booking.Booking_NO?.toString() || 'unknown';
    if (!acc[bookingNo]) {
      acc[bookingNo] = [];
    }
    acc[bookingNo].push(booking);
    return acc;
  }, {});

  // Get full name from artist details or use fallback from user object
  const getFullName = () => {
    if (artistDetails.firstName || artistDetails.lastName) {
      return `${artistDetails.firstName} ${artistDetails.lastName}`.trim();
    }
    
    return user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : (user?.firstName || 'Artist');
  };
  
  return (
    <ProtectedRoute allowedRoles={["artist"]}>
      <DashboardLayout title={`Welcome, ${getFullName()}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Your Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your assigned bookings and schedule
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : bookings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active bookings assigned to you
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : bookings.filter(b => 
                  new Date(b.Booking_date) >= new Date()
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Appointments scheduled from today
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : completedServicesCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Services you've successfully completed
              </p>
            </CardContent>
          </Card>
          
          {/* Card for Total Generated Amount */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <IndianRupee className="h-4 w-4 mr-1 text-primary" />
                Total Generated Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? "..." : `₹${totalEarnings.toLocaleString('en-IN')}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue from completed services
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Bookings List */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Assigned Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You don't have any active bookings assigned to you yet.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedBookings).length > 0 ? 
                  Object.entries(groupedBookings).map(([bookingNo, bookingsGroup]) => {
                    // Check if bookingsGroup exists and is an array before using map
                    if (!bookingsGroup || !Array.isArray(bookingsGroup) || bookingsGroup.length === 0) {
                      return null;
                    }
                    
                    // Use the first booking in the group for the customer details
                    const firstBooking = bookingsGroup[0];
                    
                    return (
                      <Card key={bookingNo} className="border-primary/20">
                        <CardHeader className="pb-2 flex flex-row justify-between items-center">
                          <div>
                            <h3 className="text-base font-medium">Booking #{bookingNo}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Customer: {firstBooking.name}</span>
                              {firstBooking.Address && (
                                <div className="flex items-center ml-4 text-xs">
                                  <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                                  <span className="truncate max-w-[200px]">
                                    {firstBooking.Address}
                                    {firstBooking.Pincode && `, ${firstBooking.Pincode}`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleAddNewService(firstBooking)}
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add New Service
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {bookingsGroup.map((booking) => (
                              <ArtistBookingCard
                                key={`${booking.id}-${booking.jobno}`}
                                booking={booking}
                                onStatusUpdated={fetchArtistBookings}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                : (
                  <div className="text-center py-8 text-muted-foreground">
                    Could not organize your bookings. Please try refreshing the page.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Service Dialog */}
        {selectedBooking && (
          <AddServiceDialog
            open={isAddServiceDialogOpen}
            onOpenChange={setIsAddServiceDialogOpen}
            bookingId={selectedBooking.id}
            bookingNo={selectedBooking.bookingNo}
            customerPhone={selectedBooking.customerPhone}
            customerName={selectedBooking.customerName}
            customerEmail={selectedBooking.customerEmail}
            onServiceAdded={fetchArtistBookings}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ArtistDashboard;
