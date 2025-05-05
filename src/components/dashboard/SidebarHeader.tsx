
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  onClose: () => void;
}

const SidebarHeader = ({ onClose }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between h-16 px-6 border-b">
      <Link to="/" className="flex items-center">
        <span className="text-xl font-serif font-bold">
          <span className="text-primary">Lavanya</span>
        </span>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onClose}
      >
        <X size={20} />
      </Button>
    </div>
  );
};

export default SidebarHeader;
