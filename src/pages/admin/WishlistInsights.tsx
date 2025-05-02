
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { WishlistInsights } from "@/components/admin/wishlist/WishlistInsights";

const WishlistInsightsPage = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "controller", "superadmin"]}>
      <DashboardLayout title="Wishlist Insights">
        <WishlistInsights />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default WishlistInsightsPage;
