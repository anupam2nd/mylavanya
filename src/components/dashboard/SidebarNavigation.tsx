import { Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Package,
  Users,
  List,
  BarChart,
  Palette,
  User,
  Settings,
  LogOut
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
  
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'controller';
  const isController = user?.role === 'controller';
  const isMember = user?.role === 'member';
  const isArtist = user?.role === 'artist';

  // Function to get the correct route based on user role
  const getRouteForRole = (baseRoute: string) => {
    if (isArtist) {
      return `/artist${baseRoute}`;
    } else if (isAdmin || isController) {
      return `/admin${baseRoute}`;
    } else {
      return `/user${baseRoute}`;
    }
  };

  return (
    <nav className="p-4 space-y-1">
      {!isMember && (
        <NavItem to={getRouteForRole("/dashboard")} icon={Home}>
          Dashboard
        </NavItem>
      )}

      <NavItem to={getRouteForRole("/bookings")} icon={Calendar}>
        Bookings
      </NavItem>

      {(isAdmin || isController) && (
      <>
        <NavItem to="/admin/services" icon={Package}>
          Services
        </NavItem>
                <NavItem to="/admin/artists" icon={Palette}>
            Artists
          </NavItem>
      </>
      )}

      {isController && (
        <>
          <NavItem to="/admin/users" icon={Users}>
            Users
          </NavItem>
          
          <NavItem to="/admin/members" icon={Users}>
            Members
          </NavItem>

          <NavItem to="/admin/artists" icon={Palette}>
            Artists
          </NavItem>

          <NavItem to="/admin/status" icon={List}>
            Status Management
          </NavItem>

          <NavItem to="/admin/wishlist-insights" icon={BarChart}>
            Wishlist Insights
          </NavItem>
        </>
      )}

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
