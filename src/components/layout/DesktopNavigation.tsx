
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import NavTrackingButton from "@/components/ui/NavTrackingButton";
import { ButtonCustom } from "@/components/ui/button-custom";
import ProfileDropdown from "@/components/user/ProfileDropdown";

interface DesktopNavigationProps {
  isScrolled: boolean;
  openMemberSignIn: () => void;
  navigateToDashboard: () => void;
  closeMenu: () => void;
}

const DesktopNavigation = ({ 
  isScrolled, 
  openMemberSignIn, 
  navigateToDashboard, 
  closeMenu 
}: DesktopNavigationProps) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="hidden md:flex items-center space-x-6">
      <nav className="flex items-center space-x-6">
        <Link to="/" onClick={closeMenu} className="text-gray-900 transition-all hover:text-gray-950 duration-100 ">
          Home
        </Link>
        <Link to="/services" onClick={closeMenu} className="">
          Services
        </Link>
        <Link to="/about" onClick={closeMenu} className="">
          About
        </Link>
        <Link to="/contact" onClick={closeMenu} className="">
          Contact
        </Link>
        {/* Fixed width container for NavTrackingButton */}
        <div className="w-[130px]"> 
          <NavTrackingButton />
        </div>
      </nav>

      {/* Login buttons */}
      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          user?.role === "member" ? (
            <ProfileDropdown className="text-slate-800 bg-blue-200 hover:bg-blue-100" />
          ) : (
            <Button onClick={navigateToDashboard}>Dashboard</Button>
          )
        ) : (
          <ButtonCustom 
            variant="outline" 
            size="sm" 
            onClick={openMemberSignIn} 
            className={`border-primary/20 transition-colors ${isScrolled ? 'text-foreground text-black bg-cyan-200' : 'text-black bg-cyan-200 border-white/30'}`}
          >
            Sign In
          </ButtonCustom>
        )}
      </div>
    </div>
  );
};

export default DesktopNavigation;
