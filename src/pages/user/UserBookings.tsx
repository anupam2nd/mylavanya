
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const UserBookings = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout title="My Bookings">
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have any bookings yet. Book a service to see your appointments here.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UserBookings;
