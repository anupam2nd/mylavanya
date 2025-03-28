
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

  // Redirect users to their dashboard if they're already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'admin' || user.role === 'superadmin' 
        ? '/admin/dashboard' 
        : '/user/dashboard';
      
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
