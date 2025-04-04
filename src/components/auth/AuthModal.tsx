
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthModalHeader from "./AuthModalHeader";
import LoginForm from "./LoginForm";
import ArtistLoginForm from "./ArtistLoginForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          title="Sign In"
          onClose={onClose}
          isLoading={isLoading}
        />
        
        <div className="p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="member">Member</TabsTrigger>
              <TabsTrigger value="artist">Artist</TabsTrigger>
            </TabsList>
            
            <TabsContent value="member">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="artist">
              <ArtistLoginForm />
            </TabsContent>
          </Tabs>
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
