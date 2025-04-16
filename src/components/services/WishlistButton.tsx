
import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AuthModal from "@/components/auth/AuthModal";
import { useNavigate } from "react-router-dom";

interface WishlistButtonProps {
  serviceId: string; // Changed to string for UUID
  variant?: "icon" | "button";
  className?: string;
}

const WishlistButton = ({ serviceId, variant = "icon", className }: WishlistButtonProps) => {
  const { isAuthenticated, user } = useAuth();
  const { addToWishlist, isInWishlist, removeFromWishlist, wishlistItems } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const inWishlist = isInWishlist(serviceId);

  const handleWishlistAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (inWishlist) {
        // Find the wishlist item ID
        const wishlistItem = wishlistItems.find(item => 
          item.service_id === serviceId
        );
        
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
        } else {
          toast.error("Could not find wishlist item to remove");
        }
      } else {
        await addToWishlist(serviceId);
      }
      
      // No need for additional toast messages as they're handled in the hook methods
    } catch (error) {
      console.error("Error managing wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/wishlist');
  };
  
  if (variant === "icon") {
    return (
      <>
        <button
          onClick={handleWishlistAction}
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
      {inWishlist ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWishlistAction}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-1 border-red-200 text-red-500",
              className
            )}
          >
            <Heart className="h-4 w-4 mr-1 fill-current" />
            Remove
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewWishlist}
            className="flex items-center gap-1"
          >
            View Wishlist
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleWishlistAction}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-1",
            className
          )}
        >
          <Heart className="h-4 w-4 mr-1" />
          Add to Wishlist
        </Button>
      )}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultTab="member" 
      />
    </>
  );
};

export default WishlistButton;
