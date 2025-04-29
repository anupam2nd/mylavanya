
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FloatingTrackButton = () => {
  const { isAuthenticated, user } = useAuth();
  const [hasBookings, setHasBookings] = useState(false);
  
  // Check if user has any bookings
  useEffect(() => {
    const checkUserBookings = async () => {
      if (!isAuthenticated || !user?.email) return;
      
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
  }, [isAuthenticated, user]);
  
  // Don't render the button if the user is not authenticated or has no bookings
  if (!isAuthenticated || !hasBookings) {
    return null;
  }
  
  return (
    <Link 
      to="/track-booking"
      className="fixed bottom-6 right-6 bg-primary text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-primary/90 active:bg-primary/80 transition-all z-50 flex items-center justify-center"
      aria-label="Track Booking"
    >
      <FileText className="h-5 w-5" />
      <span className="ml-2 hidden md:inline font-medium">Track Booking</span>
    </Link>
  );
};

export default FloatingTrackButton;
