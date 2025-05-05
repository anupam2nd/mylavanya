
import { CardContent, Card } from "@/components/ui/card";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Image } from "lucide-react";

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
    pname, 
    pprice, 
    pdesc, 
    discount, 
    netPayable,
    services,
    subservice,
    imageUrl
  } = service;
  
  const displayPrice = netPayable !== null && netPayable !== undefined 
    ? netPayable 
    : pprice;
  
  const hasDiscount = discount && discount > 0;
  
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
              variant="primary-outline" 
              className="w-full"
              onClick={onClick}
            >
              View Details
            </ButtonCustom>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
