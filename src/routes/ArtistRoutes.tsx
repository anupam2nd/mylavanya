
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ArtistDashboard from "@/pages/artist/ArtistDashboard";
import ArtistBookings from "@/pages/artist/ArtistBookings";
import { ROUTES } from "@/config/routes";

const ArtistRoutes = () => (
  <>
    {/* Artist Dashboard Routes */}
    <Route path={ROUTES.ARTIST.DASHBOARD} element={
      <ProtectedRoute allowedRoles={['artist']}>
        <ArtistDashboard />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ARTIST.BOOKINGS} element={
      <ProtectedRoute allowedRoles={['artist']}>
        <ArtistBookings />
      </ProtectedRoute>
    } />
  </>
);

export default ArtistRoutes;
