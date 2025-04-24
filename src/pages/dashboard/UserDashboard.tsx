
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { BookingData } from "@/components/tracking/BookingDetails";
import { subDays } from "date-fns";

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [recentBookings, setRecentBookings] = useState<number>(0);
  const [pendingBookings, setPendingBookings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        // Get all bookings for the user
        const { data, error } = await supabase
          .from('BookMST')
          .select('*')
          .eq('email', user.email)
          .order('Booking_date', { ascending: false });

        if (error) throw error;
        
        // Transform the data to match the BookingData interface
        const transformedData = data?.map(booking => ({
          ...booking,
          ProductName: booking.Purpose // Use Purpose as ProductName since it's required
        })) || [];
        
        setBookings(transformedData);
        
        // Calculate recent bookings (last 30 days)
        const thirtyDaysAgo = subDays(new Date(), 30);
        const recentCount = transformedData.filter(booking => {
          const bookingDate = new Date(booking.Booking_date);
          return bookingDate >= thirtyDaysAgo;
        }).length;
        setRecentBookings(recentCount);
        
        // Calculate pending bookings (awaiting confirmation)
        const pendingCount = transformedData.filter(booking => 
          booking.Status === 'pending'
        ).length;
        setPendingBookings(pendingCount);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleViewAllBookings = () => {
    navigate('/user/bookings');
  };

  const handleBookService = () => {
    navigate('/services');
  };

  return (
    <DashboardLayout title="User Dashboard">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Welcome back, {user?.email}</h2>
          <Button onClick={handleBookService}>Book a Service</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookings.length}</div>
              <p className="text-sm text-muted-foreground">All time booking records</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recentBookings}</div>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Awaiting Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingBookings}</div>
              <p className="text-sm text-muted-foreground">Bookings requiring your action</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="outline" onClick={handleViewAllBookings}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No bookings yet. Book a service to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div 
                    key={booking.Booking_NO} 
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{booking.Purpose}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{booking.Booking_date}</span>
                        <Clock className="w-4 h-4 ml-3 mr-1" />
                        <span>{booking.booking_time}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 text-xs font-medium rounded-full 
                      ${booking.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      booking.Status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.Status === 'beautician_assigned' ? 'bg-purple-100 text-purple-800' :
                      booking.Status === 'done' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'}`}>
                      {booking.Status?.toUpperCase() || 'PENDING'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
