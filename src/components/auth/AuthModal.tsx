
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthModalHeader from "./AuthModalHeader";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ArtistLoginForm from "./ArtistLoginForm";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "member" }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isRegistering, setIsRegistering] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <AuthModalHeader 
          title={
            activeTab === "member" 
              ? isRegistering ? "Create Account" : "Member Sign In"
              : "Artist Sign In"
          }
          onClose={onClose}
          isLoading={isLoading}
        />
        
        <div className="p-6">
          {activeTab === "member" ? (
            <>
              {isRegistering ? (
                <RegisterForm />
              ) : (
                <>
                  <LoginForm />
                  <div className="mt-4 text-center">
                    <Button
                      variant="link"
                      className="text-primary"
                      onClick={() => setIsRegistering(true)}
                    >
                      Don't have an account? Register here
                    </Button>
                  </div>
                </>
              )}
              {isRegistering && (
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    className="text-primary"
                    onClick={() => setIsRegistering(false)}
                  >
                    Already have an account? Sign in here
                  </Button>
                </div>
              )}
            </>
          ) : (
            <ArtistLoginForm />
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
