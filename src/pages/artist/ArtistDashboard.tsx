
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { parseISO, format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ArtistDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
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
      } catch (error) {
        console.error("Unexpected error fetching artist bookings:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtistBookings();
  }, [user]);
  
  return (
    <ProtectedRoute allowedRoles={["artist"]}>
      <DashboardLayout title={`Welcome, ${user?.firstName || 'Artist'}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Your Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your assigned bookings and schedule
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
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
                {isLoading ? "..." : bookings.filter(b => 
                  b.Status === "done" || b.Status === "completed"
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Services you've successfully completed
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Bookings List */}
        <Card>
          <CardHeader>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <div className={`h-2 w-full 
                      ${booking.Status === 'confirmed' ? 'bg-blue-500' : 
                        booking.Status === 'beautician_assigned' ? 'bg-purple-500' : 
                          booking.Status === 'done' || booking.Status === 'completed' ? 'bg-green-500' : 
                            'bg-gray-500'}`} 
                    />
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate mb-1">{booking.Purpose}</h3>
                      <div className="text-sm text-muted-foreground mb-2">
                        <p>Client: {booking.name}</p>
                        <p>Service: {booking.ServiceName} {booking.SubService ? `- ${booking.SubService}` : ''}</p>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{format(new Date(booking.Booking_date), 'PP')}</span>
                        <Clock className="w-3 h-3 ml-3 mr-1" />
                        <span>{booking.booking_time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className={`px-2 py-1 text-xs font-medium rounded-full 
                          ${booking.Status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                            booking.Status === 'beautician_assigned' ? 'bg-purple-100 text-purple-800' : 
                              booking.Status === 'done' || booking.Status === 'completed' ? 'bg-green-100 text-green-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                          {booking.Status === 'beautician_assigned' ? 'Assigned' : 
                            booking.Status.charAt(0).toUpperCase() + booking.Status.slice(1)}
                        </div>
                        <div className="text-sm font-medium">
                          ₹{booking.price || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ArtistDashboard;
