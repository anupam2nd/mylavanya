
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthModalHeader from "./AuthModalHeader";
import LoginForm from "./LoginForm";
import MemberLoginForm from "./MemberLoginForm";
import ArtistLoginForm from "./ArtistLoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "member" }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<"login" | "register">("login");
  const [currentType, setCurrentType] = useState(defaultTab);
  
  // Reset to login view and sync current type whenever modal is opened or defaultTab changes
  useEffect(() => {
    if (isOpen) {
      setCurrentView("login");
      setCurrentType(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Listen for tab switch events from login forms
  useEffect(() => {
    const handleSwitchToRegister = (e: CustomEvent) => {
      setCurrentView("register");
      setCurrentType(e.detail.role);
    };
    
    const handleCloseModal = () => {
      onClose();
    };

    window.addEventListener('switchToRegister', handleSwitchToRegister as EventListener);
    window.addEventListener('closeAuthModal', handleCloseModal);
    
    return () => {
      window.removeEventListener('switchToRegister', handleSwitchToRegister as EventListener);
      window.removeEventListener('closeAuthModal', handleCloseModal);
    };
  }, [onClose]);
  
  // Determine the title based on current view and type
  const getTitle = () => {
    if (currentView === "register") {
      return "Create Account";
    }
    
    switch(currentType) {
      case "artist":
        return "Artist Sign In";
      case "admin":
        return "Admin Sign In";
      default:
        return "Member Sign In";
    }
  }

  // Handle successful registration
  const handleRegisterSuccess = (email: string, password: string) => {
    // Switch back to login view
    setCurrentView("login");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <AuthModalHeader 
          title={getTitle()}
          onClose={onClose}
          isLoading={isLoading}
        />
        
        <div className="p-6">
          {currentView === "login" ? (
            // Login forms
            currentType === "artist" ? (
              <ArtistLoginForm />
            ) : currentType === "admin" ? (
              <LoginForm />
            ) : (
              <MemberLoginForm />
            )
          ) : (
            // Registration form
            <RegisterForm 
              onSuccess={handleRegisterSuccess} 
              userType={currentType}
            />
          )}
        </div>
        
        <div className="p-6 pt-2 border-t">
          <div className="text-center text-sm">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
