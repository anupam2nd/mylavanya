
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserDashboard from "@/pages/user/UserDashboard";
import Profile from "@/pages/user/Profile";
import Settings from "@/pages/user/Settings";
import UserBookings from "@/pages/user/UserBookings";
import Wishlist from "@/pages/user/Wishlist";
import { ROUTES } from "@/config/routes";

const UserRoutes = () => (
  <>
    {/* Profile and Wishlist Routes - accessible to all authenticated users */}
    <Route path={ROUTES.PROFILE} element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.WISHLIST} element={
      <ProtectedRoute>
        <Wishlist />
      </ProtectedRoute>
    } />
    
    {/* User Dashboard Routes */}
    <Route path={ROUTES.USER.DASHBOARD} element={
      <ProtectedRoute allowedRoles={['member']}>
        <UserDashboard />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.USER.PROFILE} element={
      <ProtectedRoute allowedRoles={['member']}>
        <Profile />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.USER.SETTINGS} element={
      <ProtectedRoute allowedRoles={['member']}>
        <Settings />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.USER.BOOKINGS} element={
      <ProtectedRoute allowedRoles={['member']}>
        <UserBookings />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.USER.WISHLIST} element={
      <ProtectedRoute allowedRoles={['member']}>
        <Wishlist />
      </ProtectedRoute>
    } />
  </>
);

export default UserRoutes;
