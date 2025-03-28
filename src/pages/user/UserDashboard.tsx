
import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Calendar, Clock, Users } from "lucide-react";
import { parseISO, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize with last 30 days as default
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('BookMST')
          .select('*')
          .eq('email', user.email)
          .order('Booking_date', { ascending: false });
          
        if (error) throw error;
        
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);
  
  // Calculate recent bookings for the card
  const recentBookings = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return bookings.filter(booking => {
      const date = booking.Booking_date ? parseISO(booking.Booking_date) : null;
      return date && date >= thirtyDaysAgo;
    }).length;
  }, [bookings]);
  
  // Calculate awaiting confirmation bookings
  const awaitingConfirmation = useMemo(() => {
    return bookings.filter(booking => booking.Status === "pending").length;
  }, [bookings]);

  return (
    <DashboardLayout title="Dashboard">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">
              All time booking records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : recentBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : awaitingConfirmation}
            </div>
            <p className="text-xs text-muted-foreground">
              Bookings requiring your action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/user/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No bookings found. Book your first service now!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                      <th className="text-left py-3 px-4 font-medium">Service</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                            {booking.Booking_date}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                            {booking.booking_time}
                          </div>
                        </td>
                        <td className="py-3 px-4">{booking.Purpose}</td>
                        <td className="py-3 px-4">
                          <div className={`px-3 py-1 text-xs font-medium rounded-full inline-block
                            ${booking.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.Status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                booking.Status === 'beautician_assigned' ? 'bg-purple-100 text-purple-800' :
                                  booking.Status === 'done' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'}`}>
                            {booking.Status?.toUpperCase() || 'PENDING'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/services" className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors">
                <Calendar className="h-5 w-5 mr-3 text-primary" />
                <span>Book a new service</span>
              </Link>
              <Link to="/track-booking" className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors">
                <BarChart className="h-5 w-5 mr-3 text-primary" />
                <span>Track your booking</span>
              </Link>
              <Link to="/profile" className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors">
                <Users className="h-5 w-5 mr-3 text-primary" />
                <span>Edit your profile</span>
              </Link>
              <Link to="/contact" className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors">
                <Clock className="h-5 w-5 mr-3 text-primary" />
                <span>Contact support</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
