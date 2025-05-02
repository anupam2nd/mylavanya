
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { BookingFormValues } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Asterisk } from "lucide-react";
import { Service, SelectedService } from "./types/ServiceTypes";
import { formatServiceName, getFinalPrice } from "./utils/serviceUtils";
import SelectedServicesList from "./components/SelectedServicesList";
import ServiceSelectionPopover from "./components/ServiceSelectionPopover";
import { useServices } from "./hooks/useServices";

interface ServiceSelectionFieldProps {
  initialSelectedService?: SelectedService;
}

const ServiceSelectionField: React.FC<ServiceSelectionFieldProps> = ({ initialSelectedService }) => {
  const form = useFormContext<BookingFormValues>();
  const { services, isLoading } = useServices();
  
  const selectedServices = form.watch("selectedServices") || [];
  
  // Initialize with the initial selected service if provided
  useEffect(() => {
    if (initialSelectedService && !form.getValues("selectedServices")) {
      form.setValue("selectedServices", [{
        id: initialSelectedService.id,
        name: initialSelectedService.name,
        price: initialSelectedService.price,
        originalPrice: initialSelectedService.originalPrice || initialSelectedService.price,
        quantity: initialSelectedService.quantity || 1
      }]);
    }
  }, [initialSelectedService, form]);

  const handleAddService = (service: Service) => {
    const currentServices = form.getValues("selectedServices") || [];
    const finalPrice = getFinalPrice(service);
    const serviceName = formatServiceName(service);
    
    // Check if service already exists in the selected list
    if (!currentServices.some(s => s.id === service.prod_id)) {
      const newService: SelectedService = {
        id: service.prod_id,
        name: serviceName,
        price: finalPrice,
        originalPrice: service.Price,
        quantity: 1
      };
      
      // Ensure that all required fields are provided
      form.setValue("selectedServices", [
        ...currentServices,
        newService
      ]);
    }
  };
  
  const handleRemoveService = (serviceId: number) => {
    const currentServices = form.getValues("selectedServices") || [];
    form.setValue(
      "selectedServices", 
      currentServices.filter(s => s.id !== serviceId)
    );
  };

  const updateQuantity = (serviceId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const currentServices = form.getValues("selectedServices") || [];
    const updatedServices = currentServices.map(service => 
      service.id === serviceId ? { ...service, quantity: newQuantity } : service
    );
    
    form.setValue("selectedServices", updatedServices);
  };
  
  return (
    <FormField
      control={form.control}
      name="selectedServices"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            Selected Services
            <Asterisk className="h-3 w-3 text-red-500" />
          </FormLabel>
          
          <FormControl>
            <div className="space-y-2">
              <SelectedServicesList 
                selectedServices={selectedServices}
                onRemoveService={handleRemoveService}
                onUpdateQuantity={updateQuantity}
              />
              
              <ServiceSelectionPopover
                services={services}
                selectedServices={selectedServices}
                isLoading={isLoading}
                onAddService={handleAddService}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ServiceSelectionField;
