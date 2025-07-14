
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatBot from "../chatbot/ChatBot";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect admin, superadmin, controller, or artist roles to their dashboards
      if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'artist' || user.role === 'controller') {
        let redirectPath = '/user/dashboard';
        
        // Both superadmin and admin go to admin dashboard
        if (user.role === 'superadmin' || user.role === 'admin') {
          redirectPath = '/admin/dashboard';
        } else if (user.role === 'controller') {
          redirectPath = '/controller/dashboard';
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

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full max-w-full">
        {children}
      </main>
      {/* <ChatBot /> */}
      <Footer />
    </div>
  );
};

export default MainLayout;
