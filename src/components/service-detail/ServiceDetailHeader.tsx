
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceDetailHeaderProps {
  productName: string;
  services: string;
  category: string;
  subCategory: string;
  onBack: () => void;
}

const ServiceDetailHeader = ({ 
  productName, 
  services, 
  category, 
  subCategory, 
  onBack 
}: ServiceDetailHeaderProps) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="flex-shrink-0"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl md:text-3xl font-bold truncate">
          {productName || services}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground truncate">
          {category} • {subCategory}
        </p>
      </div>
    </div>
  );
};

export default ServiceDetailHeader;
