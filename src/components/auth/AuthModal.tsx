
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupabaseMemberLoginForm from "./SupabaseMemberLoginForm";
import SupabaseRegisterForm from "./register/SupabaseRegisterForm";
import AdminLoginForm from "./AdminLoginForm";
import ArtistLoginForm from "./ArtistLoginForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "member" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showRegister, setShowRegister] = useState(false);

  const handleClose = () => {
    setShowRegister(false);
    setActiveTab(defaultTab);
    onClose();
  };

  const handleLoginSuccess = () => {
    handleClose();
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showRegister && activeTab === "member" ? "Create Member Account" : 
             activeTab === "member" ? "Member Sign In" : 
             activeTab === "admin" ? "Admin Sign In" : 
             "Artist Sign In"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="member">Member</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="artist">Artist</TabsTrigger>
          </TabsList>
          
          <TabsContent value="member" className="mt-4">
            {showRegister ? (
              <SupabaseRegisterForm 
                onSuccess={handleRegisterSuccess}
                onSignInClick={() => setShowRegister(false)}
              />
            ) : (
              <div className="space-y-4">
                <SupabaseMemberLoginForm onLoginSuccess={handleLoginSuccess} />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button 
                      className="text-primary hover:underline"
                      onClick={() => setShowRegister(true)}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="admin" className="mt-4">
            <AdminLoginForm onLoginSuccess={handleLoginSuccess} />
          </TabsContent>
          
          <TabsContent value="artist" className="mt-4">
            <ArtistLoginForm onLoginSuccess={handleLoginSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
