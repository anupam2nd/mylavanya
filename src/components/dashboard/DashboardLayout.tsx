
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNavigation } from "./SidebarNavigation";
import { DashboardHeader } from "./DashboardHeader";
import { useSidebarState } from "@/hooks/useSidebarState";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarState();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-serif font-bold">My<span className="text-primary">Lavanya</span></span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>

        <SidebarNavigation />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader 
          title={title} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
