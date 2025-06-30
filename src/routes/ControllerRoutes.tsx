
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ControllerDashboard from "@/pages/controller/ControllerDashboard";
import ControllerBookings from "@/pages/controller/ControllerBookings";
import ArtistActivity from "@/pages/controller/ArtistActivity";
import { ROUTES } from "@/config/routes";

const ControllerRoutes = () => (
  <>
    {/* Controller Dashboard Routes */}
    <Route path={ROUTES.CONTROLLER.DASHBOARD} element={
      <ProtectedRoute allowedRoles={['controller']}>
        <ControllerDashboard />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.CONTROLLER.BOOKINGS} element={
      <ProtectedRoute allowedRoles={['controller']}>
        <ControllerBookings />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.CONTROLLER.ARTIST_ACTIVITY} element={
      <ProtectedRoute allowedRoles={['controller']}>
        <ArtistActivity />
      </ProtectedRoute>
    } />
  </>
);

export default ControllerRoutes;
