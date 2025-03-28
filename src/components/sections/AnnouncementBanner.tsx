
import { X } from "lucide-react";
import { useState } from "react";

interface AnnouncementBannerProps {
  message?: string;
  showCloseButton?: boolean;
}

const AnnouncementBanner = ({
  message = "Limited Time Offer: 20% off on all beauty services this weekend!",
  showCloseButton = true
}: AnnouncementBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-primary/20 to-rose-400/20 py-3 px-4">
      <div className="container mx-auto flex items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-4xl">
          <div className="flex-1" />
          <p className="text-center text-sm md:text-base font-medium text-primary flex items-center">
            <span className="inline-block h-2 w-2 bg-primary rounded-full mr-2"></span>
            {message}
          </p>
          {showCloseButton && (
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setIsVisible(false)}
                className="text-primary/70 hover:text-primary transition-colors"
                aria-label="Close announcement"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
