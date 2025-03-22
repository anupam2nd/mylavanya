
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState<number>(0);
  const [availableServices, setAvailableServices] = useState<number>(0);
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
        // Fetch user's bookings count
        const { count: bookingCount, error: bookingError } = await supabase
          .from('BookMST')
          .select('*', { count: 'exact', head: true })
          .eq('email', user.email);
          
        if (bookingError) throw bookingError;
        
        // Fetch available services count
        const { count: serviceCount, error: serviceError } = await supabase
          .from('PriceMST')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
          
        if (serviceError) throw serviceError;
        
        setUserBookings(bookingCount || 0);
        setAvailableServices(serviceCount || 0);
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/user/bookings">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center h-6 space-x-2">
                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{userBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {userBookings > 0 
                      ? `View your ${userBookings} booking${userBookings !== 1 ? 's' : ''}`
                      : "No bookings yet"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/services">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center h-6 space-x-2">
                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{availableServices}</div>
                  <p className="text-xs text-muted-foreground">
                    {availableServices > 0 
                      ? `${availableServices} available service${availableServices !== 1 ? 's' : ''}`
                      : "No services available"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/profile">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Profile</div>
              <p className="text-xs text-muted-foreground">
                Manage your account
              </p>
            </CardContent>
          </Card>
        </Link>
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
