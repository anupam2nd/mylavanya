
import { Link } from "react-router-dom";
import {
  Home,
  Package,
  Users,
  LogOut,
  User,
  Settings,
  ClipboardList,
  Heart,
  Calendar,
  Palette,
  Shield
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const NavItem = ({ to, icon: Icon, children }: NavItemProps) => (
  <Link
    to={to}
    className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100"
  >
    <Icon className="w-5 h-5 mr-3" />
    <span>{children}</span>
  </Link>
);

export const SidebarNavigation = () => {
  const { user, logout } = useAuth();
  
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  const isController = user?.role === 'controller';
  const isArtist = user?.role === 'artist';
  const isMember = user?.role === 'member';

  return (
    <nav className="p-4 space-y-1">
      {/* Dashboard is available for all except members */}
      {!isMember && (
        <NavItem to={isArtist ? "/artist/dashboard" : "/admin/dashboard"} icon={Home}>
          Dashboard
        </NavItem>
      )}

      {/* Artist specific options */}
      {isArtist && (
        <NavItem to="/artist/bookings" icon={Calendar}>
          My Bookings
        </NavItem>
      )}

      {/* Controller specific options */}
      {isController && (
        <NavItem to="/admin/bookings" icon={Calendar}>
          Bookings
        </NavItem>
      )}

      {/* SuperAdmin specific options */}
      {isSuperAdmin && (
        <>
          <NavItem to="/admin/services" icon={Package}>
            Services
          </NavItem>
          <NavItem to="/admin/users" icon={Users}>
            Users
          </NavItem>
          <NavItem to="/admin/artists" icon={Palette}>
            Artists
          </NavItem>
          <NavItem to="/admin/status" icon={ClipboardList}>
            Status Management
          </NavItem>
          <NavItem to="/admin/wishlist-insights" icon={Heart}>
            Wishlist Insights
          </NavItem>
        </>
      )}

      {/* Admin specific options */}
      {isAdmin && !isSuperAdmin && (
        <>
          <NavItem to="/admin/bookings" icon={Calendar}>
            Bookings
          </NavItem>
          <NavItem to="/admin/services" icon={Package}>
            Services
          </NavItem>
          <NavItem to="/admin/artists" icon={Palette}>
            Artists
          </NavItem>
          <NavItem to="/admin/members" icon={Users}>
            Members
          </NavItem>
          <NavItem to="/admin/controllers" icon={Shield}>
            Controllers
          </NavItem>
        </>
      )}

      {/* Common options for all users */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <NavItem to="/profile" icon={User}>
          Profile
        </NavItem>
        <NavItem to="/settings" icon={Settings}>
          Settings
        </NavItem>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};
