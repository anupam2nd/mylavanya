
import { ButtonCustom } from "@/components/ui/button-custom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ServiceCardProps {
  service: {
    prodid: number;
    pname: string;
    pprice: number;
    pdesc?: string | null;
    discount?: number | null;
    netPayable?: number | null;
    services?: string;
    subservice?: string | null;
  };
  onClick: () => void;
}

// Helper function to get image based on service name or ID
const getServiceImage = (serviceId: number, serviceName: string) => {
  // Map different services to different images based on ID or name
  switch(serviceId) {
    case 1: 
      return "/lovable-uploads/d9a82f47-9bdb-4fc4-93d0-5fbcff7b79ed.jpg"; // Bridal Makeup
    case 2:
      return "/lovable-uploads/1167ac24-9ba6-4ffb-9110-6d3d68d873e7.png"; // Event Makeup
    case 3:
      return "/lovable-uploads/0b9c4ec6-8c62-4d2f-a9b8-bfcf1f87fabd.jpg"; // Hair Styling
    case 4:
      return "/lovable-uploads/e1283d7b-c007-46fc-98c6-f102af72e922.png"; // Nail Art
    default:
      // Fallback image or determine based on name if ID doesn't match
      if (serviceName.toLowerCase().includes("bridal")) {
        return "/lovable-uploads/d9a82f47-9bdb-4fc4-93d0-5fbcff7b79ed.jpg";
      } else if (serviceName.toLowerCase().includes("event")) {
        return "/lovable-uploads/1167ac24-9ba6-4ffb-9110-6d3d68d873e7.png";
      } else if (serviceName.toLowerCase().includes("hair")) {
        return "/lovable-uploads/0b9c4ec6-8c62-4d2f-a9b8-bfcf1f87fabd.jpg";
      } else if (serviceName.toLowerCase().includes("nail")) {
        return "/lovable-uploads/e1283d7b-c007-46fc-98c6-f102af72e922.png";
      }
      return "/placeholder.svg"; // Default fallback
  }
};

const ServiceCard = ({
  service,
  onClick
}: ServiceCardProps) => {
  const { isAuthenticated, user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const serviceImage = getServiceImage(service.prodid, service.pname);
  
  // Calculate netPayable if not provided but discount is available
  const finalPrice = service.netPayable !== null && service.netPayable !== undefined 
    ? service.netPayable 
    : service.discount 
      ? service.pprice - (service.pprice * service.discount / 100) 
      : service.pprice;
  
  useEffect(() => {
    // Check if service is in the user's wishlist
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('service_id', service.prodid)
          .maybeSingle();
          
        if (error) throw error;
        setIsInWishlist(!!data);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };
    
    checkWishlistStatus();
  }, [isAuthenticated, user, service.prodid]);
  
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isInWishlist) {
        // Get the wishlist item id first
        const { data: wishlistItem, error: fetchError } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user!.id)
          .eq('service_id', service.prodid)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Remove from wishlist
        const { error: removeError } = await supabase
          .from('wishlist')
          .delete()
          .eq('id', wishlistItem.id)
          .eq('user_id', user!.id);
          
        if (removeError) throw removeError;
        
        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: `${service.pname} has been removed from your wishlist`,
        });
      } else {
        // Add to wishlist
        const { error: addError } = await supabase
          .from('wishlist')
          .insert({
            user_id: user!.id,
            service_id: service.prodid
          });
          
        if (addError) throw addError;
        
        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: `${service.pname} has been added to your wishlist`,
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
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200">
        <img 
          alt={service.pname} 
          src={serviceImage} 
          className="w-full h-full object-cover" 
        />
      </div>
      <CardContent className="p-4">
        {/* Updated header order: Services, Subservice, ProductName */}
        <div className="mb-3">
          {service.services && (
            <span className="bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full block mb-1 inline-block font-medium">
              {service.services}
            </span>
          )}
          
          {service.subservice && (
            <div className="text-sm text-gray-800 mb-1 font-bold text-base">
              {service.subservice}
            </div>
          )}
          
          <h3 className="font-normal text-sm truncate">{service.pname}</h3>
        </div>
        
        <div className="mt-2">
          {service.discount ? (
            <div className="flex items-center space-x-2">
              <span className="line-through text-gray-500">₹{service.pprice.toFixed(2)}</span>
              <span className="text-primary font-medium">₹{finalPrice.toFixed(2)}</span>
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                {service.discount}% OFF
              </span>
            </div>
          ) : (
            <p className="text-primary font-medium">₹{service.pprice.toFixed(2)}</p>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {service.pdesc || "Professional beauty service for your special occasions"}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <ButtonCustom onClick={onClick} className="flex-1" variant="primary-gradient">
          Book Now
        </ButtonCustom>
        <button
          onClick={handleWishlistToggle}
          disabled={isLoading}
          className={`flex items-center justify-center p-2 rounded-full transition-colors ${
            isInWishlist 
              ? 'bg-rose-100 text-rose-500 hover:bg-rose-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={`${isInWishlist ? 'fill-rose-500' : ''} transition-all ${isLoading ? 'animate-pulse' : ''}`}
            size={18} 
          />
        </button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
