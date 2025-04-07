
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthModalHeaderProps {
  title: string;
  onClose: () => void;
  isLoading?: boolean;
}

export default function AuthModalHeader({ title, onClose, isLoading = false }: AuthModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        disabled={isLoading}
        className="h-8 w-8"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );
}
