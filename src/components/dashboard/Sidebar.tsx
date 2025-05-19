
import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarHeader from "./SidebarHeader";

interface SidebarProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ children, isOpen, onClose }: SidebarProps) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <SidebarHeader onClose={onClose} />
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {children}
        </nav>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;
