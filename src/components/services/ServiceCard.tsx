
import { CardContent, Card } from "@/components/ui/card";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Heart, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ServiceCardProps {
  service: {
    prodid: number;
    pname: string;
    pprice: number;
    pdesc: string | null;
    discount?: number | null;
    netPayable?: number | null;
    services?: string;
    subservice?: string | null;
    imageUrl?: string | null;
  };
  onClick: () => void;
}

const ServiceCard = ({ service, onClick }: ServiceCardProps) => {
  const { 
    prodid,
    pname, 
    pprice, 
    pdesc, 
    discount, 
    netPayable,
    services,
    subservice,
    imageUrl
  } = service;
  
  const { user, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const displayPrice = netPayable !== null && netPayable !== undefined 
    ? netPayable 
    : pprice;
  
  const hasDiscount = discount && discount > 0;

  // Check wishlist status when component mounts
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setWishlistLoading(true);
        const { data, error } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('service_id', prodid)
          .maybeSingle();
          
        if (error) throw error;
        setIsInWishlist(!!data);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      } finally {
        setWishlistLoading(false);
      }
    };
    
    checkWishlistStatus();
  }, [isAuthenticated, user, prodid]);
  
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) return;
    
    setWishlistLoading(true);
    
    try {
      if (isInWishlist) {
        // Get the wishlist item id first
        const { data: wishlistItem, error: fetchError } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('service_id', prodid)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Remove from wishlist
        const { error: removeError } = await supabase
          .from('wishlist')
          .delete()
          .eq('id', wishlistItem.id)
          .eq('user_id', user.id);
          
        if (removeError) throw removeError;
        
        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: `${pname} has been removed from your wishlist`,
        });
      } else {
        // Add to wishlist
        const { error: addError } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            service_id: prodid
          });
          
        if (addError) throw addError;
        
        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: `${pname} has been added to your wishlist`,
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your wishlist",
        variant: "destructive"
      });
    } finally {
      setWishlistLoading(false);
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {/* Image section */}
      <div className="relative w-full h-44 bg-gray-100">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={pname} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="h-12 w-12 text-gray-300" />
          </div>
        )}
        
        {/* Wishlist button as a floating button on the image */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md ${
            isInWishlist 
              ? 'bg-rose-500 text-white hover:bg-rose-600' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          } transition-all duration-300 z-10`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={`${isInWishlist ? 'fill-white' : ''} ${wishlistLoading ? 'animate-pulse' : ''}`} 
            size={20} 
          />
        </button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{pname}</h3>
            
            {(services || subservice) && (
              <div className="text-sm text-muted-foreground mt-1">
                {services && <p>{services}</p>}
                {subservice && <p>{subservice}</p>}
              </div>
            )}
            
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-lg font-bold">
                ₹{displayPrice.toFixed(2)}
              </span>
              
              {hasDiscount && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{pprice.toFixed(2)}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
            
            {pdesc && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {pdesc}
              </p>
            )}
          </div>
          
          <div className="mt-4">
            <ButtonCustom 
              variant="primary-gradient" 
              className="w-full"
              onClick={onClick}
            >
              Book Now
            </ButtonCustom>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
