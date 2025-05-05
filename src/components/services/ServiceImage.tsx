
import { Heart, Image as ImageIcon } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

interface ServiceImageProps {
  serviceId: number;
  serviceName: string;
  imageUrl?: string | null;
}

const ServiceImage = ({ serviceId, serviceName, imageUrl }: ServiceImageProps) => {
  const { isInWishlist, wishlistLoading, toggleWishlist } = useWishlist(serviceId);

  return (
    <div className="relative w-full h-44 bg-gray-100">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={serviceName} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-300" />
        </div>
      )}
      
      {/* Wishlist button as a floating button on the image */}
      <button
        onClick={toggleWishlist}
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
  );
};

export default ServiceImage;
