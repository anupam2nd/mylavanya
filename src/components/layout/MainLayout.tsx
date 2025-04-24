
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingTrackButton from "../ui/FloatingTrackButton";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only redirect admin, superadmin, or artist roles to their dashboards
  useEffect(() => {
    if (user) {
      // Only redirect admin, superadmin, or artist roles
      if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'artist') {
        let redirectPath = '/user/dashboard';
        
        if (user.role === 'superadmin') {
          redirectPath = '/admin/status';
        } else if (user.role === 'admin') {
          redirectPath = '/admin/dashboard';
        } else if (user.role === 'artist') {
          redirectPath = '/artist/dashboard';
        }
        
        // Only redirect if we're on the homepage
        if (window.location.pathname === '/') {
          navigate(redirectPath);
        }
      }
      // Members will stay on whatever page they're on - no redirection
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <FloatingTrackButton />
      <Footer />
    </div>
  );
};

export default MainLayout;
