
import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { MemberNotifications } from "./MemberNotifications";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [confirmedBookingsCount, setConfirmedBookingsCount] = useState(0);
  
  useEffect(() => {
    const fetchBookingsCount = async () => {
      if (!user) return;
      
      try {
        if (user.role === "member") {
          const { count, error } = await supabase
            .from('BookMST')
            .select('*', { count: 'exact', head: true })
            .eq('Status', 'confirmed')
            .eq('email', user.email);
            
          if (error) {
            console.error("Error fetching confirmed bookings count:", error);
            return;
          }
          
          setConfirmedBookingsCount(count || 0);
        }
      } catch (error) {
        console.error("Error in fetchBookingsCount:", error);
      }
    };
    
    fetchBookingsCount();
  }, [user]);
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <div className="flex items-center gap-2">
      {user?.role === "member" && <MemberNotifications />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-primary/20">
            My Profile
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
            {confirmedBookingsCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {confirmedBookingsCount}
              </Badge>
            )}
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
    </div>
  );
};

export default ProfileDropdown;
