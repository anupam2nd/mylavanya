
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
        <img 
          src="/lovable-uploads/9d8090d4-b87b-45c1-870b-fffaa3d62e81.png" 
          alt="Lavanya - A Blend of Beauty & Grace" 
          className="h-8 md:h-10"
        />
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
