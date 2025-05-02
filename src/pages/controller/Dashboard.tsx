
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ControllerDashboard } from "@/components/controller/ControllerDashboard";

const ControllerDashboardPage = () => {
  return (
    <ProtectedRoute allowedRoles={["controller", "admin", "superadmin"]}>
      <DashboardLayout title="Controller Dashboard">
        <ControllerDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ControllerDashboardPage;
