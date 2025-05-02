
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import TrackBooking from "./pages/TrackBooking";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminServices from "./pages/admin/AdminServices";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStatus from "./pages/admin/AdminStatus";
import AdminArtists from "./pages/admin/AdminArtists";
import UserDashboard from "./pages/user/UserDashboard";
import UserBookings from "./pages/user/UserBookings";
import Profile from "./pages/user/Profile";
import Settings from "./pages/user/Settings";
import ArtistDashboard from "./pages/artist/ArtistDashboard";
import Wishlist from "./pages/user/Wishlist";

// Log to confirm App is being loaded
console.log("App component rendering");

// This component scrolls to top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/track-booking" element={<TrackBooking />} />
            <Route path="/wishlist" element={<Wishlist />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/status" element={<AdminStatus />} />
            <Route path="/admin/artists" element={<AdminArtists />} />
            
            {/* User Routes */}
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/bookings" element={<UserBookings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Artist Routes */}
            <Route path="/artist/dashboard" element={<ArtistDashboard />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
