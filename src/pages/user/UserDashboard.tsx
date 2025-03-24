
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import { subDays } from "date-fns";

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [recentBookings, setRecentBookings] = useState<number>(0);
  const [pendingBookings, setPendingBookings] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !user?.email) return;
      
      setLoading(true);
      try {
        // Fetch all user's bookings
        const { data: bookings, error: bookingError } = await supabase
          .from('BookMST')
          .select('*')
          .eq('email', user.email);
          
        if (bookingError) throw bookingError;
        
        setTotalBookings(bookings?.length || 0);
        
        // Recent bookings (last 30 days)
        const thirtyDaysAgo = subDays(new Date(), 30);
        const recentCount = bookings?.filter(booking => {
          const bookingDate = new Date(booking.Booking_date);
          return bookingDate >= thirtyDaysAgo;
        }).length || 0;
        setRecentBookings(recentCount);
        
        // Pending bookings (awaiting confirmation)
        const pendingCount = bookings?.filter(booking => 
          booking.Status === 'pending'
        ).length || 0;
        setPendingBookings(pendingCount);
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return null; // Prevent flash of content before redirect
  }

  return (
    <DashboardLayout title="Your Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center h-6 space-x-2">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{totalBookings}</div>
                <p className="text-sm text-muted-foreground">
                  All time booking records
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center h-6 space-x-2">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{recentBookings}</div>
                <p className="text-sm text-muted-foreground">
                  Last 30 days
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Awaiting Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center h-6 space-x-2">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{pendingBookings}</div>
                <p className="text-sm text-muted-foreground">
                  Bookings requiring your action
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is your user dashboard. From here you can:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <Link to="/services" className="text-blue-600 hover:underline">
                  Make new bookings
                </Link>
              </li>
              <li>
                <Link to="/user/bookings" className="text-blue-600 hover:underline">
                  View your booking history
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-blue-600 hover:underline">
                  Manage your profile
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-600 hover:underline">
                  Contact customer support
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
