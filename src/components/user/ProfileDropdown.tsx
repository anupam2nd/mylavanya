
import React from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { User, BookOpen, Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileDropdownProps {
  className?: string;
}

const ProfileDropdown = ({ className }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Get user's display name - prioritize firstName if available
  const displayName = user?.firstName 
    ? `${user.firstName}` 
    : user?.email?.split('@')[0] || "My Profile";
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("border-primary/20", className)}>
          Welcome {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 text-sm font-medium">
          {user?.firstName ? `${user.firstName} ${user?.lastName || ''}` : user?.email}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/user/bookings")} className="cursor-pointer">
          <BookOpen className="mr-2 h-4 w-4" />
          <span>My Bookings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/wishlist")} className="cursor-pointer">
          <Heart className="mr-2 h-4 w-4" />
          <span>Wishlist</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
