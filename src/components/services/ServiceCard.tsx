
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

// Helper function to get image based on service name or ID
const getServiceImage = (serviceId: number, serviceName: string) => {
  // Map different services to different images based on ID or name
  switch(serviceId) {
    case 1: 
      return "/lovable-uploads/d9a82f47-9bdb-4fc4-93d0-5fbcff7b79ed.jpg"; // Bridal Makeup
    case 2:
      return "/lovable-uploads/1167ac24-9ba6-4ffb-9110-6d3d68d873e7.png"; // Event Makeup
    case 3:
      return "/lovable-uploads/0b9c4ec6-8c62-4d2f-a9b8-bfcf1f87fabd.jpg"; // Hair Styling
    case 4:
      return "/lovable-uploads/e1283d7b-c007-46fc-98c6-f102af72e922.png"; // Nail Art
    default:
      // Fallback image or determine based on name if ID doesn't match
      if (serviceName.toLowerCase().includes("bridal")) {
        return "/lovable-uploads/d9a82f47-9bdb-4fc4-93d0-5fbcff7b79ed.jpg";
      } else if (serviceName.toLowerCase().includes("event")) {
        return "/lovable-uploads/1167ac24-9ba6-4ffb-9110-6d3d68d873e7.png";
      } else if (serviceName.toLowerCase().includes("hair")) {
        return "/lovable-uploads/0b9c4ec6-8c62-4d2f-a9b8-bfcf1f87fabd.jpg";
      } else if (serviceName.toLowerCase().includes("nail")) {
        return "/lovable-uploads/e1283d7b-c007-46fc-98c6-f102af72e922.png";
      }
      return "/placeholder.svg"; // Default fallback
  }
};

const ServiceCard = ({
  service,
  onClick
}: ServiceCardProps) => {
  const serviceImage = getServiceImage(service.prodid, service.pname);
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200">
        <img 
          alt={service.pname} 
          src={serviceImage} 
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
        <ButtonCustom onClick={onClick} className="w-full" variant="primary-gradient">
          Book Now
        </ButtonCustom>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
