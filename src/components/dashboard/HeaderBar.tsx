
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderBarProps {
  title: string;
  userEmail?: string;
  userRole?: string;
  onOpenSidebar: () => void;
}

const HeaderBar = ({ title, userEmail, userRole, onOpenSidebar }: HeaderBarProps) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 lg:hidden"
            onClick={onOpenSidebar}
          >
            <Menu size={20} />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center">
          {userEmail && (
            <span className="text-sm font-medium text-gray-900 mr-2">
              {userEmail}
            </span>
          )}
          {userRole && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {userRole}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
