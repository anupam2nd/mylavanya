
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

// Add any type definitions or interfaces needed for components
interface DashboardData {
  upcomingBookings: number;
  completedBookings: number;
  totalBookings: number;
  // Add other data fields as needed
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    upcomingBookings: 0,
    completedBookings: 0,
    totalBookings: 0,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch bookings data based on user role
        let query = supabase.from('BookMST').select('*');
        
        if (user?.role === 'member') {
          query = query.eq('email', user.email);
        } else if (user?.role === 'artist' && user?.id) {
          // For artists, only show bookings assigned to them
          // Convert string ID to number for DB query
          query = query.eq('ArtistId', parseInt(user.id.toString()));
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          // Convert IDs to strings for UI
          const formattedBookings: Booking[] = data.map(booking => ({
            ...booking,
            id: booking.id.toString(),
            Booking_NO: booking.Booking_NO ? booking.Booking_NO.toString() : '',
            ArtistId: booking.ArtistId ? booking.ArtistId.toString() : undefined,
            Product: booking.Product ? booking.Product.toString() : undefined
          }));
          
          setBookings(formattedBookings);
          
          // Calculate dashboard stats
          const upcoming = formattedBookings.filter(b => 
            b.Status !== 'done' && b.Status !== 'cancelled'
          ).length;
          
          const completed = formattedBookings.filter(b => 
            b.Status === 'done'
          ).length;
          
          setDashboardData({
            upcomingBookings: upcoming,
            completedBookings: completed,
            totalBookings: formattedBookings.length
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchUserDashboardData();
    }
  }, [user]);

  // Render the dashboard with the fetched data
  return (
    <ProtectedRoute>
      <DashboardLayout title="Dashboard">
        {/* Dashboard content goes here */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.upcomingBookings}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.completedBookings}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.totalBookings}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UserDashboard;
