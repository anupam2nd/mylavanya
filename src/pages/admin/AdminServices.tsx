
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AdminServices = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Manage Services">
        <Card>
          <CardHeader>
            <CardTitle>Service Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Here you can manage your service offerings, update prices, and add new services.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminServices;
