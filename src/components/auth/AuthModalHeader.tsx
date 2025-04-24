
import { X } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthModalHeaderProps {
  title: string;
  onClose: () => void;
  isLoading: boolean;
}

export default function AuthModalHeader({ 
  title, 
  onClose, 
  isLoading 
}: AuthModalHeaderProps) {
  return (
    <DialogHeader className="pt-6 px-6">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-xl font-semibold">
          {title}
        </DialogTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full" 
          onClick={onClose}
          disabled={isLoading}
        >
          <X size={18} />
        </Button>
      </div>
    </DialogHeader>
  );
}
