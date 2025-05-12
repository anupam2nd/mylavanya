
import NavLink from "./NavLink";
import { Home, Calendar, Package, Paintbrush, Heart, Activity, UsersIcon, ListChecks, HelpCircle, UserPlus, User, Settings, LogOut } from "lucide-react";

interface AdminNavProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isController: boolean;
  logout: () => void;
}

const AdminNav = ({ isAdmin, isSuperAdmin, isController, logout }: AdminNavProps) => {
  // Dashboard link for different user types
  const dashboardLink = isAdmin 
    ? "/admin/dashboard" 
    : isController 
      ? "/controller/dashboard" 
      : "/artist/dashboard"; // Changed from "/user/dashboard" to "/artist/dashboard"
  
  // Bookings link for different user types
  const bookingsLink = isAdmin 
    ? "/admin/bookings" 
    : isController 
      ? "/controller/bookings" 
      : "/user/bookings";
      
  // Activity link based on role
  const activityLink = isAdmin || isSuperAdmin
    ? "/admin/artist-activity"
    : "/controller/artist-activity";

  return (
    <>
      <NavLink to={dashboardLink} icon={Home}>Dashboard</NavLink>
      <NavLink to={bookingsLink} icon={Calendar}>Bookings</NavLink>

      {/* Admin and SuperAdmin sections */}
      {(isAdmin || isSuperAdmin) && (
        <>
          <NavLink to="/admin/services" icon={Package}>Services</NavLink>
          <NavLink to="/admin/artists" icon={Paintbrush}>Artists</NavLink>
          <NavLink to="/admin/wishlist" icon={Heart}>Customer Wishlists</NavLink>
          <NavLink to="/admin/artist-activity" icon={Activity}>Artist Activity</NavLink>
        </>
      )}

      {/* Controller users get Artist Activity and Wishlist options */}
      {isController && (
        <>
          <NavLink to="/controller/artist-activity" icon={Activity}>Artist Activity</NavLink>
          <NavLink to="/admin/wishlist" icon={Heart}>Customer Wishlists</NavLink>
        </>
      )}

      {/* Added new section for SuperAdmin table management */}
      {isSuperAdmin && (
        <>
          <NavLink to="/admin/users" icon={UsersIcon}>Users</NavLink>
          <NavLink to="/admin/status" icon={ListChecks}>Status Management</NavLink>
          <NavLink to="/admin/faqs" icon={HelpCircle}>FAQ Management</NavLink>
          <NavLink to="/admin/members" icon={UserPlus}>Member Management</NavLink>
        </>
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

export default AdminNav;
