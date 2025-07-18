
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import AuthModal from "@/components/auth/AuthModal";

export interface ServiceCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  imageUrl?: string;
  category?: string;
  scheme?: string;
  isInWishlist?: boolean;
  discount?: number;
  onClick?: () => void;
}

const ServiceCard = ({
  id,
  name,
  description,
  price,
  discountedPrice,
  imageUrl,
  category,
  scheme,
  isInWishlist = false,
  discount,
  onClick,
}: ServiceCardProps) => {
  const { isAuthenticated, user } = useAuth();
  const { toggleWishlist, isInWishlist: wishlistStatus, wishlistLoading } = useWishlist(id);
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const isMember = user?.role === 'member';
  
  const handleWishlistToggle = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist");
      return;
    }
    
    setInWishlist((prev) => !prev);
    await toggleWishlist();
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Redirect to service detail page with booking intent
    navigate(`/services/${id}?book=true`);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // After login, redirect to service detail page with booking intent
    navigate(`/services/${id}?book=true`);
  };

  // Format description to remove HTML tags
  const cleanDescription = description?.replace(/<[^>]*>?/gm, '') || '';
  
  // Truncate description if it's too long
  const truncatedDescription = cleanDescription.length > 100 
    ? `${cleanDescription.substring(0, 100)}...` 
    : cleanDescription;

  // Determine if we should show the original price (only show if different from discounted price)
  const showOriginalPrice = discountedPrice && price !== discountedPrice;

  // Format price without unnecessary trailing zeros
  const formatPrice = (price: number) => {
    return `₹${price.toFixed(0)}`;
  };

  const handleCardClick = () => {
    if (onClick) onClick();
  };

  return (
    <>
      <Card 
        className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <div className="relative pt-[56.25%] bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {category && (
            <span className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded">
              {category}
            </span>
          )}
          
          {isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart 
                className={`h-5 w-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
            </button>
          )}
        </div>
        
        <CardContent className="flex-grow p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{name}</h3>
          
          <div className="flex items-baseline mb-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(discountedPrice || price)}
            </span>
            
            {showOriginalPrice && (
              <>
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {formatPrice(price)}
                </span>
                {discount && discount > 0 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                    {discount}% OFF
                  </span>
                )}
              </>
            )}
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-3">{truncatedDescription}</p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          <Button 
            onClick={handleBookNow}
            className="w-full"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book Now
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/services/${id}`);
            }}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="member"
        onLoginSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default ServiceCard;
