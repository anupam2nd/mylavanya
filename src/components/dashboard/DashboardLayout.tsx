
import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Settings, Home, Calendar, Heart, Package, Paintbrush, Users as UsersIcon, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';
  const isMember = user?.role === 'member';
  const isController = user?.role === 'controller';

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-serif font-bold"><span className="text-primary">Lavanya</span></span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        <nav className="p-4 space-y-1">
          {isMember ? (
            <>
              <Link to="/"
                className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                <Home className="w-5 h-5 mr-3" />
                <span>Home</span>
              </Link>
              
              <Link to="/user/bookings"
                className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                <Calendar className="w-5 h-5 mr-3" />
                <span>My Bookings</span>
              </Link>
              
              <Link to="/services"
                className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                <Package className="w-5 h-5 mr-3" />
                <span>Services</span>
              </Link>
              
              <Link to="/wishlist"
                className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                <Heart className="w-5 h-5 mr-3" />
                <span>Wishlist</span>
              </Link>
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <Link to="/profile"
                  className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                  <User className="w-5 h-5 mr-3" />
                  <span>Profile</span>
                </Link>
                <Link to="/settings"
                  className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to={isAdmin ? "/admin/dashboard" : "/user/dashboard"} 
                className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                <Home className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>

              <Link to={isAdmin ? "/admin/bookings" : "/user/bookings"}
                className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                <Calendar className="w-5 h-5 mr-3" />
                <span>Bookings</span>
              </Link>

              {(isAdmin || isSuperAdmin || isController) && (
                <>
                  <Link to="/admin/services"
                    className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                    <Package className="w-5 h-5 mr-3" />
                    <span>Services</span>
                  </Link>
                  
                  <Link to="/admin/artists"
                    className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                    <Paintbrush className="w-5 h-5 mr-3" />
                    <span>Artists</span>
                  </Link>
                  
                  <Link to="/admin/wishlist"
                    className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                    <Heart className="w-5 h-5 mr-3" />
                    <span>Customer Wishlists</span>
                  </Link>
                </>
              )}

              {isSuperAdmin && (
                <>
                  <Link to="/admin/users"
                    className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                    <UsersIcon className="w-5 h-5 mr-3" />
                    <span>Users</span>
                  </Link>
                  
                  <Link to="/admin/status"
                    className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                    <ListChecks className="w-5 h-5 mr-3" />
                    <span>Status Management</span>
                  </Link>
                </>
              )}

              <div className="pt-4 mt-4 border-t border-gray-200">
                <Link to="/profile"
                  className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                  <User className="w-5 h-5 mr-3" />
                  <span>Profile</span>
                </Link>
                <Link to="/settings"
                  className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </nav>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-4 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={20} />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-2">
                {user?.email}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
