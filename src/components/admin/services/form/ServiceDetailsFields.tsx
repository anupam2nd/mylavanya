
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ServiceDetailsFieldsProps {
  serviceName: string;
  subService: string;
  scheme: string;
  category: string;
  serviceDescription: string;
  productName: string;
  onServiceNameChange: (value: string) => void;
  onSubServiceChange: (value: string) => void;
  onSchemeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const ServiceDetailsFields = ({
  serviceName,
  subService,
  scheme,
  category,
  serviceDescription,
  productName,
  onServiceNameChange,
  onSubServiceChange,
  onSchemeChange,
  onCategoryChange,
  onDescriptionChange,
}: ServiceDetailsFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="service-name" className="text-right">
          Service Name*
        </Label>
        <Input
          id="service-name"
          value={serviceName}
          onChange={(e) => onServiceNameChange(e.target.value)}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="sub-service" className="text-right">
          Sub-service
        </Label>
        <Input
          id="sub-service"
          value={subService}
          onChange={(e) => onSubServiceChange(e.target.value)}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="scheme" className="text-right">
          Scheme
        </Label>
        <Input
          id="scheme"
          value={scheme}
          onChange={(e) => onSchemeChange(e.target.value)}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">
          Category
        </Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="product-name" className="text-right">
          Product Name
        </Label>
        <Input
          id="product-name"
          value={productName}
          className="col-span-3 bg-gray-100"
          disabled
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="service-description" className="text-right">
          Description
        </Label>
        <Textarea
          id="service-description"
          value={serviceDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="col-span-3"
          rows={3}
        />
      </div>
    </>
  );
};

export default ServiceDetailsFields;
