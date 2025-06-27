
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ServiceImageProps {
  imageUrl?: string;
  productName: string;
}

const ServiceImage = ({ imageUrl, productName }: ServiceImageProps) => {
  return (
    <div className="w-full rounded-lg overflow-hidden bg-white shadow-sm">
      <AspectRatio ratio={16 / 9}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </AspectRatio>
    </div>
  );
};

export default ServiceImage;
