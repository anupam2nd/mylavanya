
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import HeaderBar from "./HeaderBar";
import AdminNav from "./AdminNav";
import MemberNav from "./MemberNav";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';
  const isMember = user?.role === 'member';
  const isController = user?.role === 'controller';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        {isMember ? (
          <MemberNav logout={logout} />
        ) : (
          <AdminNav 
            isAdmin={isAdmin} 
            isSuperAdmin={isSuperAdmin} 
            isController={isController} 
            logout={logout} 
          />
        )}
      </Sidebar>

      <div className="flex flex-col flex-1 overflow-hidden">
        <HeaderBar 
          title={title} 
          userEmail={user?.email}
          userRole={user?.role}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
