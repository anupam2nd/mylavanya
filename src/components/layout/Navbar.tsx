
import AuthModal from "@/components/auth/AuthModal";
import { useNavbarLogic } from "./useNavbarLogic";
import NavbarHeader from "./NavbarHeader";
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";

const Navbar = () => {
  const {
    isOpen,
    isScrolled,
    isAuthModalOpen,
    authModalTab,
    toggleMenu,
    closeMenu,
    navigateToDashboard,
    openMemberSignIn,
    handleLogout,
    setIsAuthModalOpen
  } = useNavbarLogic();
  
  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 py-3 overflow-hidden transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <NavbarHeader 
          isScrolled={isScrolled}
          isOpen={isOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
        
        <DesktopNavigation 
          isScrolled={isScrolled}
          openMemberSignIn={openMemberSignIn}
          navigateToDashboard={navigateToDashboard}
          closeMenu={closeMenu}
        />
      </header>
      
      <MobileNavigation 
        isOpen={isOpen}
        openMemberSignIn={openMemberSignIn}
        navigateToDashboard={navigateToDashboard}
        closeMenu={closeMenu}
        handleLogout={handleLogout}
      />
      
      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16"></div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultTab={authModalTab} 
      />
    </>
  );
};

export default Navbar;
