
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import TrackBooking from "./pages/TrackBooking";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// User Dashboard Pages
import UserDashboard from "./pages/user/UserDashboard";
import Profile from "./pages/user/Profile";
import Settings from "./pages/user/Settings";
import UserBookings from "./pages/user/UserBookings";
import Wishlist from "./pages/user/Wishlist";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminServices from "./pages/admin/AdminServices";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminArtists from "./pages/admin/AdminArtists";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBannerImages from "./pages/admin/AdminBannerImages";
import AdminStatus from "./pages/admin/AdminStatus";
import AdminFaqs from "./pages/admin/AdminFaqs";
import WishlistController from "./pages/admin/WishlistController";
import AdminArtistActivity from "./pages/admin/AdminArtistActivity";

// Artist Dashboard Pages
import ArtistDashboard from "./pages/artist/ArtistDashboard";
import ArtistBookings from "./pages/artist/ArtistBookings";

// Controller Dashboard Pages
import ControllerDashboard from "./pages/controller/ControllerDashboard";
import ControllerBookings from "./pages/controller/ControllerBookings";
import ArtistActivity from "./pages/controller/ArtistActivity";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/track" element={<TrackBooking />} />
            <Route path="/track-booking" element={<TrackBooking />} />
            
            {/* Profile and Wishlist Routes - accessible to all authenticated users */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } />
            
            {/* User Dashboard Routes */}
            <Route path="/user/dashboard" element={
              <ProtectedRoute allowedRoles={['member']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/user/profile" element={
              <ProtectedRoute allowedRoles={['member']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/user/settings" element={
              <ProtectedRoute allowedRoles={['member']}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/user/bookings" element={
              <ProtectedRoute allowedRoles={['member']}>
                <UserBookings />
              </ProtectedRoute>
            } />
            <Route path="/user/wishlist" element={
              <ProtectedRoute allowedRoles={['member']}>
                <Wishlist />
              </ProtectedRoute>
            } />

            {/* Admin Dashboard Routes - Fixed to include superadmin */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminServices />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminBookings />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/members" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminMembers />
              </ProtectedRoute>
            } />
            <Route path="/admin/artists" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminArtists />
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminCategories />
              </ProtectedRoute>
            } />
            <Route path="/admin/banner-images" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminBannerImages />
              </ProtectedRoute>
            } />
            <Route path="/admin/status" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminStatus />
              </ProtectedRoute>
            } />
            <Route path="/admin/faqs" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminFaqs />
              </ProtectedRoute>
            } />
            <Route path="/admin/wishlist" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <WishlistController />
              </ProtectedRoute>
            } />
            <Route path="/admin/artist-activity" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminArtistActivity />
              </ProtectedRoute>
            } />

            {/* Artist Dashboard Routes */}
            <Route path="/artist/dashboard" element={
              <ProtectedRoute allowedRoles={['artist']}>
                <ArtistDashboard />
              </ProtectedRoute>
            } />
            <Route path="/artist/bookings" element={
              <ProtectedRoute allowedRoles={['artist']}>
                <ArtistBookings />
              </ProtectedRoute>
            } />

            {/* Controller Dashboard Routes */}
            <Route path="/controller/dashboard" element={
              <ProtectedRoute allowedRoles={['controller']}>
                <ControllerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/controller/bookings" element={
              <ProtectedRoute allowedRoles={['controller']}>
                <ControllerBookings />
              </ProtectedRoute>
            } />
            <Route path="/controller/artist-activity" element={
              <ProtectedRoute allowedRoles={['controller']}>
                <ArtistActivity />
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
