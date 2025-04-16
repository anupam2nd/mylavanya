
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";

interface ServiceCardProps {
  id: string; // Changed from number to string for UUID consistency
  title: string;
  price: number;
  category?: string;
  description?: string;
  onClick?: () => void;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  price,
  category,
  description,
  onClick,
  showAddToCart = true,
  showWishlist = true,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  className,
}) => {
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  // Check if service is in wishlist
  const serviceInWishlist = isWishlisted !== undefined 
    ? isWishlisted 
    : wishlist.some(item => item.service_id.toString() === id.toString());
  
  const handleToggleWishlist = async () => {
    if (onToggleWishlist) {
      onToggleWishlist();
      return;
    }
    
    if (!user) return;
    
    try {
      if (serviceInWishlist) {
        const wishlistEntry = wishlist.find(item => item.service_id.toString() === id.toString());
        if (wishlistEntry) {
          await removeFromWishlist(wishlistEntry.id);
        }
      } else {
        await addToWishlist(id);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
    }
  };

  return (
    <Card 
      className={cn("overflow-hidden h-full flex flex-col", className)}
      onClick={onClick}
    >
      <CardContent className="p-4 flex-1">
        <div className="space-y-1.5">
          {category && (
            <span className="text-xs text-muted-foreground uppercase">
              {category}
            </span>
          )}
          <h3 className="font-semibold text-lg leading-tight">{title}</h3>
          <div className="text-lg font-medium">₹{price}</div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {description}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2 flex-shrink-0">
        {showAddToCart && (
          <Button 
            variant="default" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
          </Button>
        )}
        
        {showWishlist && user && (
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleWishlist();
            }}
          >
            <Heart 
              className={cn(
                "h-4 w-4", 
                serviceInWishlist ? "fill-primary text-primary" : ""
              )} 
            />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
