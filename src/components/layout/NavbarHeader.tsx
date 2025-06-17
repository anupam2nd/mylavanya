
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface NavbarHeaderProps {
  isScrolled: boolean;
  isOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const NavbarHeader = ({ isScrolled, isOpen, toggleMenu, closeMenu }: NavbarHeaderProps) => {
  return (
    <div className="container mx-auto px-4 h-full flex items-center relative z-10">
      <div className="flex justify-between items-center w-full">
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <img src="/lovable-uploads/d54e9c20-bb5a-4b53-8583-572cd5d79e51.png" alt="Lavanya" className="h-10 md:h-12" />
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className={`md:hidden relative z-[60] transition-colors ${isScrolled ? 'text-gray-700' : 'text-gray-700'}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </div>
  );
};

export default NavbarHeader;
