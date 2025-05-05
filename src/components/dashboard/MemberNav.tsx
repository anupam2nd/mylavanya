
import NavLink from "./NavLink";
import { Home, Calendar, Package, Heart, User, Settings, LogOut } from "lucide-react";

interface MemberNavProps {
  logout: () => void;
}

const MemberNav = ({ logout }: MemberNavProps) => {
  return (
    <>
      <NavLink to="/" icon={Home}>Home</NavLink>
      <NavLink to="/user/bookings" icon={Calendar}>My Bookings</NavLink>
      <NavLink to="/services" icon={Package}>Services</NavLink>
      <NavLink to="/wishlist" icon={Heart}>Wishlist</NavLink>
      
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

export default MemberNav;
