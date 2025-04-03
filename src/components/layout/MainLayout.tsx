
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

  // Redirect users to their dashboard based on role if they're already logged in
  useEffect(() => {
    if (user) {
      let redirectPath = '/user/dashboard';
      
      if (user.role === 'superadmin') {
        redirectPath = '/admin/status';
      } else if (user.role === 'admin') {
        redirectPath = '/admin/dashboard';
      }
      
      // Only redirect if we're on the homepage
      if (window.location.pathname === '/') {
        navigate(redirectPath);
      }
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
