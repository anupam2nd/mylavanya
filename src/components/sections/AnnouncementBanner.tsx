
import { X } from "lucide-react";
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnnouncementBannerProps {
  message?: string;
  showCloseButton?: boolean;
  backgroundImage?: string;
}

const AnnouncementBanner = ({
  message = "Limited Time Offer: 20% off on all beauty services this weekend!",
  showCloseButton = true,
  backgroundImage = "/lovable-uploads/d9a82f47-9bdb-4fc4-93d0-5fbcff7b79ed.jpg"
}: AnnouncementBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();

  if (!isVisible) return null;

  return (
    <div className="w-full relative overflow-hidden">
      {/* Background image with proper aspect ratio */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AspectRatio ratio={isMobile ? 3/1 : 6/1} className="h-full">
          <img 
            src={backgroundImage} 
            alt="Banner background" 
            className="w-full h-full object-cover"
          />
        </AspectRatio>
      </div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-rose-400/60 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 py-4 px-4">
        <div className="container mx-auto flex items-center justify-center">
          <div className="flex items-center justify-between w-full max-w-4xl">
            <div className="flex-1" />
            <p className="text-center text-sm md:text-base font-medium text-white flex items-center">
              <span className="inline-block h-2 w-2 bg-white rounded-full mr-2"></span>
              {message}
            </p>
            {showCloseButton && (
              <div className="flex-1 flex justify-end">
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close announcement"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
