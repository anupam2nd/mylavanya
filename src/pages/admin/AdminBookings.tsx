
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AdminBookings = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Manage Bookings">
        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No bookings available yet. New bookings will appear here once customers start making appointments.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminBookings;
