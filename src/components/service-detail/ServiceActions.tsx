
import { Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

interface ServiceActionsProps {
  price: number;
  netPayable?: number;
  discount?: number;
  category: string;
  subCategory: string;
  isAuthenticated: boolean;
  isInWishlist: boolean;
  wishlistLoading: boolean;
  onBookNow: () => void;
  onWishlistToggle: () => void;
}

const ServiceActions = ({
  price,
  netPayable,
  discount,
  category,
  subCategory,
  isAuthenticated,
  isInWishlist,
  wishlistLoading,
  onBookNow,
  onWishlistToggle
}: ServiceActionsProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleBookNowClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      onBookNow();
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    onBookNow();
  };

  return (
    <>
      <Card className="p-4 md:p-6 shadow-sm">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-2xl md:text-3xl font-bold text-primary">
            ₹{netPayable || price}
          </span>
          {netPayable && netPayable !== price && (
            <>
              <span className="text-lg md:text-xl text-gray-500 line-through">
                ₹{price}
              </span>
              {discount && discount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {discount}% OFF
                </Badge>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {subCategory}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            size="lg" 
            className="flex-1 text-base py-3"
            onClick={handleBookNowClick}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Book Now
          </Button>
          
          {isAuthenticated && (
            <Button
              variant="outline"
              size="lg"
              onClick={onWishlistToggle}
              disabled={wishlistLoading}
              className="sm:w-auto"
            >
              <Heart 
                className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
          )}
        </div>
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

export default ServiceActions;
