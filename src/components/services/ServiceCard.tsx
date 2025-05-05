
import { CardContent, Card } from "@/components/ui/card";
import { ButtonCustom } from "@/components/ui/button-custom";
import ServiceImage from "./ServiceImage";
import ServicePrice from "./ServicePrice";

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
    prodid,
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
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <ServiceImage 
        serviceId={prodid}
        serviceName={pname}
        imageUrl={imageUrl}
      />
      
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
            
            <ServicePrice 
              displayPrice={displayPrice}
              originalPrice={pprice}
              discount={discount}
            />
            
            {pdesc && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {pdesc}
              </p>
            )}
          </div>
          
          <div className="mt-4">
            <ButtonCustom 
              variant="primary-gradient" 
              className="w-full"
              onClick={onClick}
            >
              Book Now
            </ButtonCustom>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
