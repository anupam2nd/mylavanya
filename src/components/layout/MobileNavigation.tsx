
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ButtonCustom } from "@/components/ui/button-custom";

interface MobileNavigationProps {
  isOpen: boolean;
  openMemberSignIn: () => void;
  navigateToDashboard: () => void;
  closeMenu: () => void;
  handleLogout: () => void;
}

const MobileNavigation = ({ 
  isOpen, 
  openMemberSignIn, 
  navigateToDashboard, 
  closeMenu, 
  handleLogout 
}: MobileNavigationProps) => {
  const { user, isAuthenticated } = useAuth();
  
  // Get user's display name - prioritize firstName if available
  const displayName = user?.firstName ? `${user.firstName}` : user?.email?.split('@')[0] || "My Profile";

  return (
    <div className={`md:hidden fixed left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 z-[55] transition-all duration-300 ease-in-out ${
      isOpen ? 'top-[64px] opacity-100 visible' : 'top-[-400px] opacity-0 invisible'
    }`}>
      <div className="py-6 px-4">
        <nav className="flex flex-col space-y-4">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-primary transition-colors py-2 border-b border-gray-100" 
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link 
            to="/services" 
            className="text-gray-700 hover:text-primary transition-colors py-2 border-b border-gray-100" 
            onClick={closeMenu}
          >
            Services
          </Link>
          <Link 
            to="/about" 
            className="text-gray-700 hover:text-primary transition-colors py-2 border-b border-gray-100" 
            onClick={closeMenu}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="text-gray-700 hover:text-primary transition-colors py-2 border-b border-gray-100" 
            onClick={closeMenu}
          >
            Contact
          </Link>
          
          {/* Mobile login section */}
          <div className="pt-4">
            {isAuthenticated ? (
              user?.role === "member" ? (
                <div className="space-y-3">
                  <div className="font-medium text-primary pb-2 border-b border-gray-100">
                    Welcome {displayName}
                  </div>
                  <Link 
                    to="/profile" 
                    className="block py-2 text-gray-700 hover:text-primary transition-colors" 
                    onClick={closeMenu}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/user/bookings" 
                    className="block py-2 text-gray-700 hover:text-primary transition-colors" 
                    onClick={closeMenu}
                  >
                    My Bookings
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="block py-2 text-gray-700 hover:text-primary transition-colors" 
                    onClick={closeMenu}
                  >
                    Wishlist
                  </Link>
                  <Link 
                    to="/track-booking" 
                    className="block py-2 text-gray-700 hover:text-primary transition-colors" 
                    onClick={closeMenu}
                  >
                    Track Booking
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-600 p-0 h-auto" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    navigateToDashboard();
                    closeMenu();
                  }} 
                  className="w-full"
                >
                  Dashboard
                </Button>
              )
            ) : (
              <ButtonCustom 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  openMemberSignIn();
                  closeMenu();
                }} 
                className="border-primary/20 text-foreground w-full"
              >
                Sign In
              </ButtonCustom>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
