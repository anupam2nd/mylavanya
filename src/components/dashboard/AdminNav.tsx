
import { LayoutDashboard, Users, Calendar, Settings, Wrench, UserCheck, Heart, HelpCircle, Palette, LogOut, Image, FolderTree, FileText, UserPlus } from "lucide-react";
import NavLink from "./NavLink";
import { Button } from "@/components/ui/button";

interface AdminNavProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isController: boolean;
  isArtist: boolean;
  logout: () => void;
}

const AdminNav = ({ isAdmin, isSuperAdmin, isController, isArtist, logout }: AdminNavProps) => {
  // If user is an artist, only show Dashboard, Bookings, and Logout
  if (isArtist) {
    return (
      <nav className="mt-8 space-y-2">
        {/* Dashboard for Artist */}
        <NavLink to="/artist/dashboard" icon={LayoutDashboard}>
          Dashboard
        </NavLink>

        {/* Bookings for Artist */}
        <NavLink to="/artist/bookings" icon={Calendar}>
          Bookings
        </NavLink>

        {/* Logout for Artist */}
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
  }

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

      {/* Banner Images - Available for Admin, SuperAdmin, and Controller */}
      {(isAdmin || isSuperAdmin || isController) && (
        <NavLink to="/admin/banner-images" icon={Image}>
          Banner Images
        </NavLink>
      )}

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

          {/* Users - Only for SuperAdmin */}
          {isSuperAdmin && (
            <NavLink to="/admin/users" icon={Users}>
              Users
            </NavLink>
          )}

          {/* Members - Only for SuperAdmin (removed for Admin) */}
          {isSuperAdmin && (
            <NavLink to="/admin/members" icon={Users}>
              Members
            </NavLink>
          )}
        </>
      )}

      {/* Artist Request - Available for all roles except artists */}
      <NavLink to={isController ? "/controller/artist-requests" : "/admin/artist-requests"} icon={FileText}>
        Artist Request
      </NavLink>

      {/* External Leads - Available for all roles except artists */}
      <NavLink to={isController ? "/controller/external-leads" : "/admin/external-leads"} icon={UserPlus}>
        External Leads
      </NavLink>

      {/* Wishlist Controller - Available for all roles except artists */}
      <NavLink to={isController ? "/controller/wishlist" : "/admin/wishlist"} icon={Heart}>
        Wishlist
      </NavLink>

      {/* FAQs and Artist Activity - Only for non-controller users */}
      {!isController && (
        <>
          {/* FAQs - Only for SuperAdmin (removed for Admin) */}
          {isSuperAdmin && (
            <NavLink to="/admin/faqs" icon={HelpCircle}>
              FAQs
            </NavLink>
          )}

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
