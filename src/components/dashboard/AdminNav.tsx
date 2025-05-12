
import React from "react";
import NavLink from "./NavLink";
import {
  Home,
  CalendarDays,
  Users,
  Activity,
  BookText,
  Settings,
  LogOut,
  Heart,
  FileQuestion,
  CircleUser,
  FileBarChart2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface AdminNavProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isController: boolean;
  logout: () => void;
}

const AdminNav = ({ isAdmin, isSuperAdmin, isController, logout }: AdminNavProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Management</h2>
          <div className="space-y-1">
            <NavLink to="/admin/dashboard" icon={<Home className="mr-2 h-4 w-4" />}>
              Dashboard
            </NavLink>
            
            <NavLink to="/admin/bookings" icon={<CalendarDays className="mr-2 h-4 w-4" />}>
              Bookings
            </NavLink>
            
            {/* Artist Activity link - now available for all admin types */}
            <NavLink to="/controller/artist-activity" icon={<Activity className="mr-2 h-4 w-4" />}>
              Artist Activity
            </NavLink>

            {(isAdmin || isSuperAdmin) && (
              <>
                <NavLink to="/admin/services" icon={<BookText className="mr-2 h-4 w-4" />}>
                  Services
                </NavLink>
                
                <NavLink to="/admin/status" icon={<FileBarChart2 className="mr-2 h-4 w-4" />}>
                  Status Manager
                </NavLink>
                
                <NavLink to="/admin/artists" icon={<CircleUser className="mr-2 h-4 w-4" />}>
                  Beauticians
                </NavLink>
                
                <NavLink to="/admin/members" icon={<Users className="mr-2 h-4 w-4" />}>
                  Members
                </NavLink>

                <NavLink to="/admin/faqs" icon={<FileQuestion className="mr-2 h-4 w-4" />}>
                  FAQs
                </NavLink>
              </>
            )}

            {isSuperAdmin && (
              <NavLink to="/admin/users" icon={<Users className="mr-2 h-4 w-4" />}>
                Admin Users
              </NavLink>
            )}
            
            {(isAdmin || isSuperAdmin) && (
              <NavLink
                to="/admin/wishlist-controller"
                icon={<Heart className="mr-2 h-4 w-4" />}
              >
                Wishlist Controller
              </NavLink>
            )}
          </div>
        </div>
      </div>
      
      {/* User options */}
      <div className="mt-auto px-3 py-2">
        <Separator className="my-2" />
        <h2 className="mb-2 px-4 text-lg font-semibold">Account</h2>
        <div className="space-y-1">
          <NavLink to="/user/settings" icon={<Settings className="mr-2 h-4 w-4" />}>
            Settings
          </NavLink>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminNav;
