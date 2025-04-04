
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthModalHeader from "./AuthModalHeader";
import LoginForm from "./LoginForm";
import ArtistLoginForm from "./ArtistLoginForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "member" }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <AuthModalHeader 
          title={activeTab === "member" ? "Member Sign In" : "Artist Sign In"}
          onClose={onClose}
          isLoading={isLoading}
        />
        
        <div className="p-6">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("member")}
              className={`px-4 py-2 rounded-md ${activeTab === "member" 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-700"}`}
            >
              Member
            </button>
            <button
              onClick={() => setActiveTab("artist")}
              className={`px-4 py-2 rounded-md ${activeTab === "artist" 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-700"}`}
            >
              Artist
            </button>
          </div>
          
          {activeTab === "member" ? (
            <LoginForm />
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
