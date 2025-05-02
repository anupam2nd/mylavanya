
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Service, SelectedService } from "../types/ServiceTypes";
import { formatServiceName, getFinalPrice } from "../utils/serviceUtils";

interface ServiceSelectionPopoverProps {
  services: Service[];
  selectedServices: SelectedService[];
  isLoading: boolean;
  onAddService: (service: Service) => void;
}

const ServiceSelectionPopover: React.FC<ServiceSelectionPopoverProps> = ({ 
  services, 
  selectedServices,
  isLoading, 
  onAddService 
}) => {
  const isServiceSelected = (serviceId: number) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-gray-300 text-gray-600"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2">
          <h4 className="font-medium mb-2">Available Services</h4>
          {isLoading ? (
            <div className="p-4 text-center">
              Loading services...
            </div>
          ) : (
            <ScrollArea className="h-60">
              <div className="space-y-1 p-2">
                {services.map(service => {
                  const formattedName = formatServiceName(service);
                  const finalPrice = getFinalPrice(service);
                  const hasDiscount = finalPrice !== service.Price;
                  
                  return (
                    <div
                      key={service.prod_id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100",
                        isServiceSelected(service.prod_id) && "bg-primary/10"
                      )}
                      onClick={() => onAddService(service)}
                    >
                      <div>
                        <p className="font-medium text-sm">{formattedName}</p>
                        {hasDiscount ? (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="line-through text-gray-500">₹{service.Price.toFixed(2)}</span>
                            <span className="text-primary">₹{finalPrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">₹{finalPrice.toFixed(2)}</p>
                        )}
                      </div>
                      {isServiceSelected(service.prod_id) && (
                        <Badge variant="outline" className="bg-primary/20 border-primary/30">
                          <Check className="h-3 w-3 mr-1" /> Selected
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ServiceSelectionPopover;
