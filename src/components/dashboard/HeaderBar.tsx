
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderBarProps {
  title: string;
  userEmail?: string;
  userRole?: string;
  onOpenSidebar: () => void;
}

const HeaderBar = ({ title, userEmail, userRole, onOpenSidebar }: HeaderBarProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline truncate max-w-[120px] sm:max-w-[200px]">
            {userEmail}
          </span>
          {/* Only show role badge for non-member roles */}
          {userRole && userRole !== 'member' && (
            <Badge variant="secondary" className="text-xs">
              {userRole}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
