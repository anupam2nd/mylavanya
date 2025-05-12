
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthModalHeader from "./AuthModalHeader";
import LoginForm from "./LoginForm";
import MemberLoginForm from "./MemberLoginForm";
import ArtistLoginForm from "./ArtistLoginForm";
import RegisterForm from "./register/RegisterForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
  onLoginSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "member", onLoginSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  const getTitle = () => {
    if (showRegister) {
      return "Create Member Account";
    }
    
    switch(defaultTab) {
      case "artist":
        return "Artist Sign In";
      case "admin":
        return "Admin Sign In";
      default:
        return "Member Sign In";
    }
  }
  
  const handleLoginSuccess = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    onClose();
  };

  const toggleForm = () => {
    setShowRegister(!showRegister);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden max-h-[90vh] w-[95vw] sm:w-auto">
        <AuthModalHeader 
          title={getTitle()}
          onClose={() => {
            setShowRegister(false);
            onClose();
          }}
          isLoading={isLoading}
        />
        
        <div className="p-4 sm:p-6">
          {showRegister ? (
            <RegisterForm 
              onSuccess={(email, password) => {
                setShowRegister(false);
                // We don't auto-login here, just show the login form again
                toast.success("Registration successful! Please sign in with your new account.");
              }} 
              onSignInClick={toggleForm}
            />
          ) : defaultTab === "artist" ? (
            <ArtistLoginForm />
          ) : defaultTab === "admin" ? (
            <LoginForm />
          ) : (
            <>
              <MemberLoginForm onLoginSuccess={handleLoginSuccess} />
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={toggleForm}
                  >
                    Register now
                  </Button>
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 sm:p-6 pt-2 border-t">
          <div className="text-center text-xs sm:text-sm">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
