
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavTrackingButtonProps {
  isMobile?: boolean;
  onClick?: () => void;
}

const NavTrackingButton = ({ isMobile, onClick }: NavTrackingButtonProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If user is not authenticated, don't render anything
  if (!isAuthenticated) {
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
