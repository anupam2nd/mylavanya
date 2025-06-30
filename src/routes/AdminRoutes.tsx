
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminServices from "@/pages/admin/AdminServices";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminArtists from "@/pages/admin/AdminArtists";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminBannerImages from "@/pages/admin/AdminBannerImages";
import AdminStatus from "@/pages/admin/AdminStatus";
import AdminFaqs from "@/pages/admin/AdminFaqs";
import WishlistController from "@/pages/admin/WishlistController";
import AdminArtistActivity from "@/pages/admin/AdminArtistActivity";
import { ROUTES } from "@/config/routes";

const AdminRoutes = () => (
  <>
    {/* Admin Dashboard Routes - Fixed to include superadmin */}
    <Route path={ROUTES.ADMIN.DASHBOARD} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminDashboard />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.SERVICES} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminServices />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.BOOKINGS} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminBookings />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.USERS} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminUsers />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.MEMBERS} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminMembers />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.ARTISTS} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminArtists />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.CATEGORIES} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminCategories />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.BANNER_IMAGES} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminBannerImages />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.STATUS} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminStatus />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.FAQS} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminFaqs />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.WISHLIST} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <WishlistController />
      </ProtectedRoute>
    } />
    <Route path={ROUTES.ADMIN.ARTIST_ACTIVITY} element={
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminArtistActivity />
      </ProtectedRoute>
    } />
  </>
);

export default AdminRoutes;
