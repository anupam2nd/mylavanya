
import AuthModal from "@/components/auth/AuthModal";
import { useNavbarLogic } from "./useNavbarLogic";
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
        <DesktopNavigation 
          isScrolled={isScrolled}
          openMemberSignIn={openMemberSignIn}
          navigateToDashboard={navigateToDashboard}
          closeMenu={closeMenu}
        />

        {/* Mobile Hamburger Menu Button - positioned at top right */}
        <div className="md:hidden absolute top-3 right-4 z-[60]">
          <button 
            className={`transition-colors ${isScrolled ? 'text-gray-700' : 'text-gray-700'}`} 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
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
