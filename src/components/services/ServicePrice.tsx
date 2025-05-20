
interface ServicePriceProps {
  displayPrice: number;
  originalPrice: number;
  discount?: number | null;
}

const ServicePrice = ({ displayPrice, originalPrice, discount }: ServicePriceProps) => {
  const hasDiscount = discount && discount > 0;
  // Only show original price if it's different from display price
  const showOriginalPrice = originalPrice !== displayPrice;

  // Format price without unnecessary trailing zeros
  const formatPrice = (price: number) => {
    return `₹${price.toFixed(0)}`;
  };

  return (
    <div className="mt-4 flex items-baseline gap-2">
      <span className="text-lg font-bold">
        {formatPrice(displayPrice)}
      </span>
      
      {showOriginalPrice && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(originalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
              {discount}% OFF
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default ServicePrice;
