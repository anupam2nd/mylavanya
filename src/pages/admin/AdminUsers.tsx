
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AdminUsers = () => {
  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="User Management">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Here you can manage system users, assign roles, and handle access permissions.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminUsers;
