
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, navigate]);

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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                View your bookings
              </p>
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
              <div className="text-2xl font-bold">Book</div>
              <p className="text-xs text-muted-foreground">
                Browse available services
              </p>
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
              <li>Make new bookings</li>
              <li>View your booking history</li>
              <li>Manage your profile</li>
              <li>Contact customer support</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
