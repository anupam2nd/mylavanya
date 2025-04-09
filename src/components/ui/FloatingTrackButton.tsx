
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FloatingTrackButton = () => {
  const { user } = useAuth();
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    const checkForUserBookings = async () => {
      // Only check for bookings if the user is a member
      if (user && user.role === "member") {
        try {
          const { count, error } = await supabase
            .from('BookMST')
            .select('*', { count: 'exact', head: true })
            .eq('email', user.email);
            
          if (error) {
            console.error("Error checking bookings:", error);
            return;
          }
          
          // Show the button only if the member has at least one booking
          setShowButton(count !== null && count > 0);
        } catch (error) {
          console.error("Error in checkForUserBookings:", error);
        }
      } else {
        // Hide the button for non-members or unauthenticated users
        setShowButton(false);
      }
    };
    
    checkForUserBookings();
  }, [user]);
  
  // Don't render the button if it shouldn't be shown
  if (!showButton) return null;
  
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
