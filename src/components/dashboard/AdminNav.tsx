
import { LayoutDashboard, Users, Calendar, Settings, Wrench, UserCheck, Heart, HelpCircle, Palette, LogOut, Image, FolderTree } from "lucide-react";
import NavLink from "./NavLink";
import { Button } from "@/components/ui/button";

interface AdminNavProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isController: boolean;
  logout: () => void;
}

const AdminNav = ({ isAdmin, isSuperAdmin, isController, logout }: AdminNavProps) => {
  return (
    <nav className="mt-8 space-y-2">
      {/* Dashboard - Available for all roles */}
      <NavLink to={isController ? "/controller/dashboard" : "/admin/dashboard"} icon={LayoutDashboard}>
        Dashboard
      </NavLink>

      {/* Bookings - Available for all roles */}
      <NavLink to={isController ? "/controller/bookings" : "/admin/bookings"} icon={Calendar}>
        Bookings
      </NavLink>

      {/* Controller users only get Dashboard, Bookings, Wishlist, and Logout */}
      {!isController && (
        <>
          {/* Services - Only for Admin and SuperAdmin */}
          <NavLink to="/admin/services" icon={Settings}>
            Services
          </NavLink>

          {/* Categories - Only for Admin and SuperAdmin */}
          {(isAdmin || isSuperAdmin) && (
            <NavLink to="/admin/categories" icon={FolderTree}>
              Categories
            </NavLink>
          )}

          {/* Status Management - Only for SuperAdmin */}
          {isSuperAdmin && (
            <NavLink to="/admin/status" icon={Wrench}>
              Status
            </NavLink>
          )}

          {/* Artists */}
          <NavLink to="/admin/artists" icon={UserCheck}>
            Artists
          </NavLink>

          {/* Banner Images - Only for Admin and SuperAdmin */}
          {(isAdmin || isSuperAdmin) && (
            <NavLink to="/admin/banner-images" icon={Image}>
              Banner Images
            </NavLink>
          )}

          {/* Users - Only for SuperAdmin */}
          {isSuperAdmin && (
            <NavLink to="/admin/users" icon={Users}>
              Users
            </NavLink>
          )}

          {/* Members */}
          <NavLink to="/admin/members" icon={Users}>
            Members
          </NavLink>
        </>
      )}

      {/* Wishlist Controller - Available for all roles */}
      <NavLink to="/admin/wishlist" icon={Heart}>
        Wishlist
      </NavLink>

      {/* FAQs and Artist Activity - Only for non-controller users */}
      {!isController && (
        <>
          {/* FAQs */}
          <NavLink to="/admin/faqs" icon={HelpCircle}>
            FAQs
          </NavLink>

          {/* Artist Activity */}
          <NavLink to="/admin/artist-activity" icon={Palette}>
            Artist Activity
          </NavLink>
        </>
      )}

      {/* Logout - Available for all roles */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default AdminNav;
