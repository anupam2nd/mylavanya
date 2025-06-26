
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
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
    <div className="container mx-auto px-4 h-full flex items-center relative z-10">
      <div className="flex justify-between items-center w-full">
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <img src="/lovable-uploads/d54e9c20-bb5a-4b53-8583-572cd5d79e51.png" alt="Lavanya" className="h-10 md:h-12" />
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            <Link to="/" onClick={closeMenu} className={`transition-all hover:text-gray-950 duration-100 ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              Home
            </Link>
            <Link to="/services" onClick={closeMenu} className={`transition-all hover:text-gray-950 duration-100 ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              Services
            </Link>
            <Link to="/about" onClick={closeMenu} className={`transition-all hover:text-gray-950 duration-100 ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              About
            </Link>
            <Link to="/contact" onClick={closeMenu} className={`transition-all hover:text-gray-950 duration-100 ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              Contact
            </Link>
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
                Book Now
              </ButtonCustom>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopNavigation;
