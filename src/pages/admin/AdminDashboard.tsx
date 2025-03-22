
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeServices, setActiveServices] = useState<number>(0);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [activeStatuses, setActiveStatuses] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Redirect non-admin users to appropriate dashboard
    if (user && user.role !== "admin" && user.role !== "superadmin") {
      navigate("/user/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      try {
        // Fetch active services count
        const { count: serviceCount, error: serviceError } = await supabase
          .from('PriceMST')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
          
        if (serviceError) throw serviceError;
        
        // Fetch total bookings count
        const { count: bookingCount, error: bookingError } = await supabase
          .from('BookMST')
          .select('*', { count: 'exact', head: true });
          
        if (bookingError) throw bookingError;
        
        // Fetch active users count
        const { count: userCount, error: userError } = await supabase
          .from('UserMST')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
          
        if (userError) throw userError;
        
        // Fetch active statuses count
        const { count: statusCount, error: statusError } = await supabase
          .from('statusmst')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
          
        if (statusError) throw statusError;
        
        setActiveServices(serviceCount || 0);
        setTotalBookings(bookingCount || 0);
        setActiveUsers(userCount || 0);
        setActiveStatuses(statusCount || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return null; // Prevent flash of content before redirect
  }

  const isSuperAdmin = user.role === 'superadmin';

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/bookings">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
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
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    Manage all bookings
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/services">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Services
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
                  <div className="text-2xl font-bold">{activeServices}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeServices > 0 
                      ? `${activeServices} active service${activeServices !== 1 ? 's' : ''}`
                      : "No active services"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
        
        {isSuperAdmin && (
          <Link to="/admin/users">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  User Management
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
                    <div className="text-2xl font-bold">{activeUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {activeUsers > 0 
                        ? `${activeUsers} active user${activeUsers !== 1 ? 's' : ''}`
                        : "No active users"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        )}
        
        {isSuperAdmin && (
          <Link to="/admin/status">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Status Management
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
                    <div className="text-2xl font-bold">{activeStatuses}</div>
                    <p className="text-xs text-muted-foreground">
                      {activeStatuses > 0 
                        ? `${activeStatuses} active status${activeStatuses !== 1 ? 'es' : ''}`
                        : "No active statuses"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.role}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is your admin dashboard. From here you can manage:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <Link to="/admin/bookings" className="text-blue-600 hover:underline">
                  Bookings and appointments
                </Link>
              </li>
              <li>
                <Link to="/admin/services" className="text-blue-600 hover:underline">
                  Services and pricing
                </Link>
              </li>
              {isSuperAdmin && (
                <li>
                  <Link to="/admin/users" className="text-blue-600 hover:underline">
                    Users and staff
                  </Link>
                </li>
              )}
              {isSuperAdmin && (
                <li>
                  <Link to="/admin/status" className="text-blue-600 hover:underline">
                    Status management
                  </Link>
                </li>
              )}
              <li>
                <Link to="/admin/bookings" className="text-blue-600 hover:underline">
                  Reports and analytics
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
