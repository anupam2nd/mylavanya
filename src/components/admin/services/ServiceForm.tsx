
import { useState } from "react";
import { useCustomToast } from "@/context/ToastContext";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Import refactored components
import ServiceDetailsFields from "./form/ServiceDetailsFields";
import PricingCalculator from "./form/PricingCalculator";
import ImageUploader from "./form/ImageUploader";
import { useServiceForm } from "./form/useServiceForm";

export interface Service {
  prod_id: number;
  Services: string;
  ProductName: string | null;
  Description: string | null;
  Price: number;
  active?: boolean;
  Subservice?: string | null;
  Scheme?: string | null;
  Category?: string | null;
  SubCategory?: string | null;
  Discount?: number | null;
  NetPayable?: number | null;
  imageUrl?: string | null;
  created_at?: string;
}

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentService: Service | null;
  isNewService: boolean;
  onSave: (service: Service) => void;
  services: Service[];
}

const ServiceForm = ({
  open,
  onOpenChange,
  currentService,
  isNewService,
  onSave,
  services
}: ServiceFormProps) => {
  const { showToast } = useCustomToast();
  const {
    serviceName,
    setServiceName,
    subService,
    setSubService,
    scheme,
    setScheme,
    category,
    setCategory,
    subCategory,
    setSubCategory,
    serviceDescription,
    setServiceDescription,
    servicePrice,
    discount,
    netPayable,
    imagePreview,
    imageError,
    generateProductName,
    handlePriceChange,
    handleDiscountChange,
    handleNetPayableChange,
    handleImageUpload,
    handleRemoveImage,
    handleSave
  } = useServiceForm({
    currentService,
    isNewService,
    open,
    onSave
  });

  const handleSubmit = async () => {
    try {
      await handleSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving service:', error);
      showToast("❌ Save failed", 'error', 4000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewService ? "Add New Service" : "Edit Service"}</DialogTitle>
          <DialogDescription>
            {isNewService 
              ? "Add a new service to your catalog." 
              : "Make changes to the existing service."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ServiceDetailsFields 
            serviceName={serviceName}
            subService={subService}
            scheme={scheme}
            category={category}
            subCategory={subCategory}
            serviceDescription={serviceDescription}
            productName={generateProductName()}
            onServiceNameChange={setServiceName}
            onSubServiceChange={setSubService}
            onSchemeChange={setScheme}
            onCategoryChange={setCategory}
            onSubCategoryChange={setSubCategory}
            onDescriptionChange={setServiceDescription}
          />
          
          <PricingCalculator 
            price={servicePrice}
            discount={discount}
            netPayable={netPayable}
            onPriceChange={handlePriceChange}
            onDiscountChange={handleDiscountChange}
            onNetPayableChange={handleNetPayableChange}
          />
          
          <ImageUploader 
            imagePreview={imagePreview}
            imageError={imageError}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!serviceName || !servicePrice || !!imageError}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceForm;
