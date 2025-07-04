
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const useNavbarLogic = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("member");
  const { user, logout } = useAuth();
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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const navigateToDashboard = () => {
    closeMenu();
    if (user?.role === "admin" || user?.role === "superadmin") {
      navigate("/admin/dashboard");
    } else if (user?.role === "artist") {
      navigate("/artist/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };
  
  const openMemberSignIn = () => {
    setAuthModalTab("member");
    setIsAuthModalOpen(true);
  };
  
  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return {
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
  };
};
