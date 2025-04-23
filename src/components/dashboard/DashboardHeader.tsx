
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { NotificationsBell } from "@/components/admin/notifications/NotificationsBell";

interface DashboardHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const DashboardHeader = ({ title, onMenuClick }: DashboardHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 lg:hidden"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Only show bell if controller */}
          {user?.role === "controller" && (
            <NotificationsBell userEmail={user.email} />
          )}
          <span className="text-sm font-medium text-gray-900 mr-2">
            {user?.email}
          </span>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
};
