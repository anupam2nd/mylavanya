
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FloatingTrackButton = () => {
  const { isAuthenticated, user } = useAuth();
  const [hasBookings, setHasBookings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user has any bookings
  useEffect(() => {
    const checkUserBookings = async () => {
      setIsLoading(true);
      
      if (!isAuthenticated || !user?.email) {
        setIsLoading(false);
        return;
      }
      
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
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserBookings();
  }, [isAuthenticated, user]);
  
  // Don't render anything if not authenticated or has no bookings after loading completes
  if (!isLoading && (!isAuthenticated || !hasBookings)) {
    return null;
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isLoading ? (
        // Invisible placeholder with same dimensions as the actual button
        <div className="h-12 w-12 md:w-[148px] opacity-0">
          <span className="sr-only">Loading booking tracking...</span>
        </div>
      ) : (
        <Link 
          to="/track-booking"
          className="bg-primary text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-primary/90 active:bg-primary/80 transition-all flex items-center justify-center"
          aria-label="Track Booking"
        >
          <FileText className="h-5 w-5" />
          <span className="ml-2 hidden md:inline font-medium">Track Booking</span>
        </Link>
      )}
    </div>
  );
};

export default FloatingTrackButton;
