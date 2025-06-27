
interface ServiceImageProps {
  imageUrl?: string;
  productName: string;
}

const ServiceImage = ({ imageUrl, productName }: ServiceImageProps) => {
  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
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
    </div>
  );
};

export default ServiceImage;
