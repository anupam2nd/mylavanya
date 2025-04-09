
import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AuthModal from "@/components/auth/AuthModal";

interface WishlistButtonProps {
  serviceId: number;
  variant?: "icon" | "button";
  className?: string;
}

const WishlistButton = ({ serviceId, variant = "icon", className }: WishlistButtonProps) => {
  const { isAuthenticated } = useAuth();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const inWishlist = isInWishlist(serviceId);

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await addToWishlist(serviceId);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (variant === "icon") {
    return (
      <>
        <button
          onClick={handleAddToWishlist}
          className={cn(
            "rounded-full p-2 transition-colors",
            inWishlist ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500",
            isLoading && "opacity-50 cursor-wait",
            className
          )}
          disabled={isLoading}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn("h-5 w-5", inWishlist && "fill-current")}
          />
        </button>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          defaultTab="member" 
        />
      </>
    );
  }
  
  return (
    <>
      <Button
        variant={inWishlist ? "outline" : "secondary"}
        size="sm"
        onClick={handleAddToWishlist}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-1",
          inWishlist && "border-red-200 text-red-500",
          className
        )}
      >
        <Heart className={cn("h-4 w-4 mr-1", inWishlist && "fill-current")} />
        {inWishlist ? "In Wishlist" : "Add to Wishlist"}
      </Button>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultTab="member" 
      />
    </>
  );
};

export default WishlistButton;
