
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { ButtonCustom } from "@/components/ui/button-custom";
import { cn } from "@/lib/utils";
import AuthModal from "../auth/AuthModal";
import NavTrackingButton from "../ui/NavTrackingButton";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleBookNow = () => {
    navigate("/services");
  };
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "py-3 bg-white/95 backdrop-blur-lg shadow-sm" 
          : "py-6 bg-transparent"
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-serif font-bold">My<span className="text-primary">Lavanya</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.href}
                className={cn(
                  "nav-link",
                  location.pathname === link.href && "nav-link-active"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center space-x-3">
            <NavTrackingButton />
            
            <ButtonCustom 
              variant="outline" 
              size="md" 
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User size={18} className="mr-2" />
              Sign In
            </ButtonCustom>
            
            <ButtonCustom 
              variant="primary-gradient"
              onClick={handleBookNow}
            >
              Book Now
            </ButtonCustom>
          </div>
          
          <div className="flex items-center md:hidden">
            <ButtonCustom
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </ButtonCustom>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-lg shadow-md pt-4 pb-6 px-4 animate-slide-down border-t">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.href}
                className={cn(
                  "py-2 px-3 rounded-md transition-colors",
                  location.pathname === link.href 
                    ? "bg-accent text-accent-foreground font-medium" 
                    : "hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/track-booking"
              className="py-2 px-3 rounded-md transition-colors hover:bg-muted flex items-center"
            >
              <span>Track Booking</span>
            </Link>
            <div className="pt-2 space-y-3">
              <ButtonCustom 
                variant="outline" 
                size="md" 
                className="w-full justify-start"
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <User size={16} className="mr-2" />
                Sign In
              </ButtonCustom>
              <ButtonCustom 
                variant="primary-gradient" 
                className="w-full"
                onClick={handleBookNow}
              >
                Book Now
              </ButtonCustom>
            </div>
          </nav>
        </div>
      )}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
}
