
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rupee } from "@/components/icons/Rupee";
import { useNavigate } from "react-router-dom";
import WishlistButton from "./WishlistButton";

interface ServiceCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: string;
  onBookNow?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  description,
  price,
  category,
  onBookNow,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/services/${id}`);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookNow) onBookNow();
    else navigate(`/services/${id}`);
  };

  return (
    <Card 
      className="group h-full overflow-hidden cursor-pointer transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3 relative">
        {category && (
          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
            {category}
          </span>
        )}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>
          <div className="absolute top-3 right-3">
            <WishlistButton serviceId={id} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {description || "Professional beauty service for all occasions."}
        </p>
        <div className="flex items-center mt-3">
          <div className="flex items-center">
            <Rupee className="h-4 w-4 mr-0.5" />
            <span className="text-lg font-bold">{price}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          className="w-full bg-primary text-white hover:bg-primary/90"
          onClick={handleBookNow}
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
