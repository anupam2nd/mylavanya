
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import NavTrackingButton from "@/components/ui/NavTrackingButton";
import { ButtonCustom } from "@/components/ui/button-custom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const {
    user,
    isAuthenticated
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToDashboard = () => {
    closeMenu();
    if (user?.role === "admin" || user?.role === "superadmin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

  return <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <span className="text-xl font-bold text-primary">Lavanya</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link to="/" className="text-gray-700 hover:text-primary transition-colors" onClick={closeMenu}>
                  Home
                </Link>
                <Link to="/services" className="text-gray-700 hover:text-primary transition-colors" onClick={closeMenu}>
                  Services
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-primary transition-colors" onClick={closeMenu}>
                  About
                </Link>
                <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors" onClick={closeMenu}>
                  Contact
                </Link>
                <NavTrackingButton />
              </nav>

              {/* Login buttons */}
              <div className="flex items-center space-x-2">
                {isAuthenticated ? (
                  <Button onClick={navigateToDashboard}>Dashboard</Button>
                ) : (
                  <>
                    <ButtonCustom variant="outline" size="sm" onClick={() => setIsAuthModalOpen(true)} className="border-primary/20 text-foreground">
                      Admin Signin
                    </ButtonCustom>
                    <ButtonCustom variant="outline" size="sm" onClick={() => setIsAuthModalOpen(true)} className="border-primary/20 text-foreground">
                      Member Signin
                    </ButtonCustom>
                    <ButtonCustom variant="outline" size="sm" onClick={() => setIsAuthModalOpen(true)} className="border-primary/20 text-foreground">
                      Artist Signin
                    </ButtonCustom>
                  </>
                )}
              </div>
            </div>

            <button className="md:hidden" onClick={toggleMenu}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && <div className="md:hidden bg-white shadow-lg py-4 px-4 absolute top-full left-0 right-0">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors" onClick={closeMenu}>
                Home
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-primary transition-colors" onClick={closeMenu}>
                Services
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-primary transition-colors" onClick={closeMenu}>
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors" onClick={closeMenu}>
                Contact
              </Link>
              <NavTrackingButton isMobile={true} onClick={closeMenu} />
              
              {/* Mobile login buttons */}
              <div className="pt-2 border-t border-gray-200 grid grid-cols-3 gap-2">
                {isAuthenticated ? (
                  <Button onClick={() => {
                    navigateToDashboard();
                    closeMenu();
                  }} className="w-full col-span-3">
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <ButtonCustom variant="outline" size="sm" onClick={() => {
                      setIsAuthModalOpen(true);
                      closeMenu();
                    }} className="border-primary/20 text-foreground">
                      Admin Signin
                    </ButtonCustom>
                    <ButtonCustom variant="outline" size="sm" onClick={() => {
                      setIsAuthModalOpen(true);
                      closeMenu();
                    }} className="border-primary/20 text-foreground">
                      Member Signin
                    </ButtonCustom>
                    <ButtonCustom variant="outline" size="sm" onClick={() => {
                      setIsAuthModalOpen(true);
                      closeMenu();
                    }} className="border-primary/20 text-foreground">
                      Artist Signin
                    </ButtonCustom>
                  </>
                )}
              </div>
            </nav>
          </div>}
      </header>
      {/* Add spacing to account for fixed header */}
      <div className={`${isScrolled ? "h-16" : "h-20"}`}></div>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>;
};

export default Navbar;
