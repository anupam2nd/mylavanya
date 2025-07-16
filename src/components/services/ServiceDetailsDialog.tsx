import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { useNavigate } from "react-router-dom";

interface Service {
  prod_id: number;
  ProductName: string;
  Description: string;
  Price: number;
  NetPayable?: number;
  Category: string;
  SubCategory: string;
  imageUrl?: string;
  Discount?: number;
  Scheme?: string;
}

interface ServiceDetailsDialogProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (service: Service) => void;
}

export default function ServiceDetailsDialog({
  service,
  isOpen,
  onClose,
  onSelect,
}: ServiceDetailsDialogProps) {
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist, wishlistLoading } = useWishlist(service?.prod_id || 0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  if (!service) return null;

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    await toggleWishlist();
  };

  const handleSelect = () => {
    onSelect(service);
    onClose();
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    navigate(`/services/${service.prod_id}?book=true`);
  };

  const displayPrice = service.NetPayable || service.Price;
  const hasDiscount = service.NetPayable && service.NetPayable < service.Price;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold pr-8">
              {service.ProductName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-4">
            {/* Service Image */}
            <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.ProductName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{service.Category}</Badge>
              <Badge variant="outline">{service.SubCategory}</Badge>
              {service.Scheme && (
                <Badge variant="default">{service.Scheme}</Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                ₹{displayPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{service.Price}
                  </span>
                  {service.Discount && (
                    <Badge variant="destructive">
                      {service.Discount}% OFF
                    </Badge>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-base mb-2">Description</h3>
              <div 
                className="text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: service.Description }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={handleSelect} className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                Select for Booking
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBookNow}
                className="flex-1"
              >
                Book Now
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className="w-full sm:w-auto"
                >
                  <Heart 
                    className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="member"
        onLoginSuccess={() => {
          setShowAuthModal(false);
          handleWishlistToggle();
        }}
      />
    </>
  );
}