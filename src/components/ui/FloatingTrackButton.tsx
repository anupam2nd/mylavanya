import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
const FloatingTrackButton = () => {
  const {
    isAuthenticated,
    user
  } = useAuth();
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
        const {
          data,
          error
        } = await supabase.from("BookMST").select("id").eq("email", user.email).limit(1);
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

  // Always render a container div to prevent layout shifts, regardless of content visibility
  return <div className="fixed bottom-6 right-6 z-50 h-12 w-[148px]">
      {!isLoading && isAuthenticated && hasBookings && <Link to="/track-booking" className="bg-primary text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-primary/90 active:bg-primary/80 transition-all flex items-center justify-center" aria-label="Track Booking">
          <FileText className="h-7 w-7" />
          <span className="ml-2 hidden md:inline font-medium text-sm text-nowrap">Track Booking</span>
        </Link>}
    </div>;
};
export default FloatingTrackButton;