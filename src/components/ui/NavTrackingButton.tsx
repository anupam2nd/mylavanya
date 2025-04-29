
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NavTrackingButtonProps {
  isMobile?: boolean;
  onClick?: () => void;
}

const NavTrackingButton = ({ isMobile, onClick }: NavTrackingButtonProps) => {
  const navigate = useNavigate();
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

  // If user is not authenticated or has no bookings, don't render anything
  if (!isAuthenticated || !hasBookings) {
    return null;
  }

  const handleClick = () => {
    navigate("/track-booking");
    if (onClick) onClick();
  };

  return (
    <Button
      variant="outline"
      size={isMobile ? "default" : "sm"}
      onClick={handleClick}
      className="flex items-center gap-1"
    >
      <Calendar className="h-4 w-4" />
      <span>Track Booking</span>
    </Button>
  );
};

export default NavTrackingButton;
