
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

        {/* Mobile Header - Logo and Menu Button */}
        <div className="md:hidden container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="flex justify-between items-center w-full">
            {/* Logo */}
            <a href="/" className="flex items-center" onClick={closeMenu}>
              <img src="/lovable-uploads/d54e9c20-bb5a-4b53-8583-572cd5d79e51.png" alt="Lavanya" className="h-10" />
            </a>
            
            {/* Hamburger Menu Button */}
            <button 
              className={`relative z-[60] transition-colors ${isScrolled ? 'text-gray-700' : 'text-gray-700'}`} 
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
