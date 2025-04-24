
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthModalHeader from "./AuthModalHeader";
import LoginForm from "./LoginForm";
import MemberLoginForm from "./MemberLoginForm";
import ArtistLoginForm from "./ArtistLoginForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "member" }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const getTitle = () => {
    switch(defaultTab) {
      case "artist":
        return "Artist Sign In";
      case "admin":
        return "Admin Sign In";
      default:
        return "Member Sign In";
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <AuthModalHeader 
          title={getTitle()}
          onClose={onClose}
          isLoading={isLoading}
        />
        
        <div className="p-6">
          {defaultTab === "artist" ? (
            <ArtistLoginForm />
          ) : defaultTab === "admin" ? (
            <LoginForm />
          ) : (
            <MemberLoginForm />
          )}
        </div>
        
        <div className="p-6 pt-2 border-t">
          <div className="text-center text-sm">
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
