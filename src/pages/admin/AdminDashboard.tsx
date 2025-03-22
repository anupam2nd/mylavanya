
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Manage all bookings
              </p>
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
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Bridal & Event Makeup
              </p>
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
                <div className="text-2xl font-bold">Users</div>
                <p className="text-xs text-muted-foreground">
                  Manage system users
                </p>
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
                <div className="text-2xl font-bold">Status</div>
                <p className="text-xs text-muted-foreground">
                  Manage system statuses
                </p>
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
              <li>Bookings and appointments</li>
              <li>Services and pricing</li>
              <li>Users and staff</li>
              <li>Reports and analytics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
