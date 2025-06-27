
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Service {
  prod_id: number;
  ProductName: string;
  Services: string;
  Price: number;
  NetPayable: number;
  imageUrl: string;
}

interface RelatedServicesProps {
  services: Service[];
}

const RelatedServices = ({ services }: RelatedServicesProps) => {
  const navigate = useNavigate();

  if (services.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-6">Related Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {services.map((service) => (
          <Card key={service.prod_id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div 
              className="aspect-video bg-gray-100 overflow-hidden"
              onClick={() => navigate(`/services/${service.prod_id}`)}
            >
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.ProductName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2 text-sm md:text-base">
                {service.ProductName || service.Services}
              </h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-bold text-primary text-sm md:text-base">
                  ₹{service.NetPayable || service.Price}
                </span>
                {service.NetPayable && service.NetPayable !== service.Price && (
                  <span className="text-xs md:text-sm text-gray-500 line-through">
                    ₹{service.Price}
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs md:text-sm"
                onClick={() => navigate(`/services/${service.prod_id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedServices;
