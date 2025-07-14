
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthProvider";
import { ToastProvider } from "@/context/ToastContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ProtectedAdminRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import TrackBooking from "@/pages/TrackBooking";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminServices from "@/pages/admin/AdminServices";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminBannerImages from "@/pages/admin/AdminBannerImages";
import AdminStatus from "@/pages/admin/AdminStatus";
import AdminArtists from "@/pages/admin/AdminArtists";
import AdminArtistActivity from "@/pages/admin/AdminArtistActivity";
import AdminFaqs from "@/pages/admin/AdminFaqs";
import WishlistController from "@/pages/admin/WishlistController";
import AdminArtistRequests from "@/pages/admin/AdminArtistRequests";
import ControllerDashboard from "@/pages/controller/ControllerDashboard";
import ControllerBookings from "@/pages/controller/ControllerBookings";
import ControllerBannerImages from "@/pages/controller/ControllerBannerImages";
import ControllerArtistRequests from "@/pages/controller/ControllerArtistRequests";
import ArtistActivity from "@/pages/controller/ArtistActivity";
import ArtistDashboard from "@/pages/artist/ArtistDashboard";
import ArtistBookings from "@/pages/artist/ArtistBookings";
import UserDashboard from "@/pages/user/UserDashboard";
import UserBookings from "@/pages/user/UserBookings";
import Profile from "@/pages/user/Profile";
import Settings from "@/pages/user/Settings";
import Wishlist from "@/pages/user/Wishlist";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/track-booking" element={<TrackBooking />} />
              
              {/* Member Routes - both /profile and /user/profile work */}
              <Route path="/profile" element={<ProtectedAdminRoute allowedRoles={['member']}><Profile /></ProtectedAdminRoute>} />
              <Route path="/wishlist" element={<ProtectedAdminRoute allowedRoles={['member']}><Wishlist /></ProtectedAdminRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/users" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminUsers /></ProtectedAdminRoute>} />
              <Route path="/admin/members" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminMembers /></ProtectedAdminRoute>} />
              <Route path="/admin/bookings" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminBookings /></ProtectedAdminRoute>} />
              <Route path="/admin/services" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminServices /></ProtectedAdminRoute>} />
              <Route path="/admin/categories" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminCategories /></ProtectedAdminRoute>} />
              <Route path="/admin/banner-images" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminBannerImages /></ProtectedAdminRoute>} />
              <Route path="/admin/status" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminStatus /></ProtectedAdminRoute>} />
              <Route path="/admin/artists" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminArtists /></ProtectedAdminRoute>} />
              <Route path="/admin/artist-activity" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminArtistActivity /></ProtectedAdminRoute>} />
              <Route path="/admin/faqs" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminFaqs /></ProtectedAdminRoute>} />
              <Route path="/admin/wishlist" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><WishlistController /></ProtectedAdminRoute>} />
              <Route path="/admin/artist-requests" element={<ProtectedAdminRoute allowedRoles={['admin', 'superadmin']}><AdminArtistRequests /></ProtectedAdminRoute>} />
              
              {/* Controller Routes */}
              <Route path="/controller/dashboard" element={<ProtectedAdminRoute allowedRoles={['controller']}><ControllerDashboard /></ProtectedAdminRoute>} />
              <Route path="/controller/bookings" element={<ProtectedAdminRoute allowedRoles={['controller']}><ControllerBookings /></ProtectedAdminRoute>} />
              <Route path="/controller/banner-images" element={<ProtectedAdminRoute allowedRoles={['controller']}><ControllerBannerImages /></ProtectedAdminRoute>} />
              <Route path="/controller/wishlist" element={<ProtectedAdminRoute allowedRoles={['controller']}><WishlistController /></ProtectedAdminRoute>} />
              <Route path="/controller/artist-requests" element={<ProtectedAdminRoute allowedRoles={['controller']}><ControllerArtistRequests /></ProtectedAdminRoute>} />
              <Route path="/controller/artist-activity" element={<ProtectedAdminRoute allowedRoles={['controller']}><ArtistActivity /></ProtectedAdminRoute>} />
              
              {/* Artist Routes */}
              <Route path="/artist/dashboard" element={<ProtectedAdminRoute allowedRoles={['artist']}><ArtistDashboard /></ProtectedAdminRoute>} />
              <Route path="/artist/bookings" element={<ProtectedAdminRoute allowedRoles={['artist']}><ArtistBookings /></ProtectedAdminRoute>} />
              
              {/* User Routes */}
              <Route path="/user/dashboard" element={<ProtectedAdminRoute allowedRoles={['member']}><UserDashboard /></ProtectedAdminRoute>} />
              <Route path="/user/bookings" element={<ProtectedAdminRoute allowedRoles={['member']}><UserBookings /></ProtectedAdminRoute>} />
              <Route path="/user/profile" element={<ProtectedAdminRoute allowedRoles={['member']}><Profile /></ProtectedAdminRoute>} />
              <Route path="/user/settings" element={<ProtectedAdminRoute allowedRoles={['member']}><Settings /></ProtectedAdminRoute>} />
              <Route path="/user/wishlist" element={<ProtectedAdminRoute allowedRoles={['member']}><Wishlist /></ProtectedAdminRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
