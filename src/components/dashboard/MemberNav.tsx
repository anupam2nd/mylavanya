
import NavLink from "./NavLink";
import { Home, Calendar, Package, Heart, User, Settings, LogOut, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MemberNavProps {
  logout: () => void;
}

const MemberNav = ({ logout }: MemberNavProps) => {
  const { user } = useAuth();
  const [hasBookings, setHasBookings] = useState(false);

  // Check if user has any bookings
  useEffect(() => {
    const checkUserBookings = async () => {
      if (!user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from("BookMST")
          .select("id")
          .eq("email", user.email)
          .limit(1);
          
        if (!error && data && data.length > 0) {
          setHasBookings(true);
        }
      } catch (error) {
        console.error("Error checking bookings:", error);
      }
    };
    
    checkUserBookings();
  }, [user]);

  return (
    <>
      <NavLink to="/" icon={Home}>Home</NavLink>
      <NavLink to="/user/bookings" icon={Calendar}>My Bookings</NavLink>
      <NavLink to="/services" icon={Package}>Services</NavLink>
      <NavLink to="/wishlist" icon={Heart}>Wishlist</NavLink>
      {hasBookings && (
        <NavLink to="/track" icon={FileText}>Track Booking</NavLink>
      )}
      
      <div className="pt-4 mt-4 border-t border-gray-200">
        <NavLink to="/profile" icon={User}>Profile</NavLink>
        <NavLink to="/settings" icon={Settings}>Settings</NavLink>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default MemberNav;
