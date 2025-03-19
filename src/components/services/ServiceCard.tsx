
import { ButtonCustom } from "@/components/ui/button-custom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ServiceCardProps {
  service: {
    prodid: number;
    pname: string;
    pprice: number;
    pdesc?: string | null;
  };
  onClick: () => void;
}

const ServiceCard = ({ service, onClick }: ServiceCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200">
        <img 
          src="/placeholder.svg"
          alt={service.pname}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate mb-1">{service.pname}</h3>
        <p className="text-primary font-medium">₹{service.pprice.toFixed(2)}</p>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {service.pdesc || "Professional beauty service for your special occasions"}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <ButtonCustom 
          onClick={onClick} 
          className="w-full"
          variant="primary-gradient"
        >
          Book Now
        </ButtonCustom>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
