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
      
      // Only fetch bookings that are assigned to this artist (excluding pending and cancelled)
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
        <div className="space-y-4 sm:space-y-6">
          <div className="px-1 sm:px-0">
            <h2 className="text-xl sm:text-2xl font-bold">Your Dashboard</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your assigned bookings and schedule
            </p>
          </div>
          
          {/* Stats Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-blue-800">
                  Total Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-blue-900">
                  {isLoading ? "..." : bookings.length}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Active bookings
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-green-800">
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-green-900">
                  {isLoading ? "..." : bookings.filter(b => 
                    new Date(b.Booking_date) >= new Date()
                  ).length}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Appointments
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-purple-800">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-purple-900">
                  {isLoading ? "..." : completedServicesCount}
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Services done
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center text-amber-800">
                  <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Total Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-amber-900">
                  {isLoading ? "..." : `₹${totalEarnings.toLocaleString('en-IN')}`}
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  From completed services
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Bookings List - Mobile Optimized */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Assigned Bookings</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl sm:text-6xl mb-4">📅</div>
                  <p className="text-sm sm:text-base">You don't have any assigned bookings yet.</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {Object.entries(groupedBookings).length > 0 ? 
                    Object.entries(groupedBookings).map(([bookingNo, bookingsGroup]) => {
                      if (!bookingsGroup || !Array.isArray(bookingsGroup) || bookingsGroup.length === 0) {
                        return null;
                      }
                      
                      const firstBooking = bookingsGroup[0];
                      
                      return (
                        <Card key={bookingNo} className="border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-medium mb-2">Booking #{bookingNo}</h3>
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <span className="font-medium">Customer:</span>
                                    <span className="ml-2 truncate">{firstBooking.name}</span>
                                  </div>
                                  {firstBooking.Address && (
                                    <div className="flex items-start text-xs sm:text-sm text-muted-foreground">
                                      <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                      <span className="truncate">
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
                                className="flex items-center gap-2 shrink-0 w-full sm:w-auto"
                              >
                                <Plus className="h-4 w-4" />
                                <span className="hidden xs:inline">Add New Service</span>
                                <span className="xs:hidden">Add Service</span>
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                      <div className="text-4xl sm:text-6xl mb-4">⚠️</div>
                      <p className="text-sm sm:text-base">Could not organize your bookings. Please try refreshing the page.</p>
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ArtistDashboard;
