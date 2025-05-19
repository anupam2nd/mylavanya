
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

  const handleClick = () => {
    navigate("/track-booking");
    if (onClick) onClick();
  };

  // Render a button with fixed dimensions regardless of state to prevent layout shifts
  return (
    <div 
      className={`${isMobile ? 'h-10' : 'h-9'} ${isMobile ? 'w-full' : 'w-[130px]'}`}
    >
      {(!isLoading && isAuthenticated && hasBookings) ? (
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={handleClick}
          className="flex items-center gap-1 w-full h-full"
        >
          <Calendar className="h-4 w-4" />
          <span>Track Booking</span>
        </Button>
      ) : (
        <div className="opacity-0 w-full h-full">
          <span className="sr-only">No bookings to track</span>
        </div>
      )}
    </div>
  );
};

export default NavTrackingButton;
