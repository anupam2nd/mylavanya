
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { BookingFormValues } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Check, Trash2, PlusCircle, Asterisk } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Service {
  prod_id: number;
  ProductName: string;
  Price: number;
}

const ServiceSelectionField = ({ initialSelectedService }: { initialSelectedService?: { id: number; name: string; price: number } }) => {
  const form = useFormContext<BookingFormValues>();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const selectedServices = form.watch("selectedServices") || [];
  
  useEffect(() => {
    // Fetch all available services
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('PriceMST')
          .select('prod_id, ProductName, Price')
          .order('ProductName');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setServices(data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  // Initialize with the initial selected service if provided
  useEffect(() => {
    if (initialSelectedService && !form.getValues("selectedServices")) {
      form.setValue("selectedServices", [initialSelectedService]);
    }
  }, [initialSelectedService, form]);
  
  const handleAddService = (service: Service) => {
    const currentServices = form.getValues("selectedServices") || [];
    // Check if service already exists in the selected list
    if (!currentServices.some(s => s.id === service.prod_id)) {
      form.setValue("selectedServices", [
        ...currentServices,
        {
          id: service.prod_id,
          name: service.ProductName || `Service ${service.prod_id}`,
          price: service.Price
        }
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
  
  const isServiceSelected = (serviceId: number) => {
    return selectedServices.some(s => s.id === serviceId);
  };
  
  // Calculate total price
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  
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
              {/* Selected services display */}
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Services in this booking</h4>
                  <div className="text-sm font-semibold">Total: ₹{totalPrice.toFixed(2)}</div>
                </div>
                
                {selectedServices.length > 0 ? (
                  <div className="space-y-2">
                    {selectedServices.map(service => (
                      <div 
                        key={service.id}
                        className="flex items-center justify-between bg-white p-2 rounded-md border"
                      >
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-sm text-gray-500">₹{service.price.toFixed(2)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveService(service.id)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-2">No services selected. Please add at least one service.</p>
                )}
              </div>
              
              {/* Add service button */}
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
                          {services.map(service => (
                            <div
                              key={service.prod_id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100",
                                isServiceSelected(service.prod_id) && "bg-primary/10"
                              )}
                              onClick={() => handleAddService(service)}
                            >
                              <div>
                                <p className="font-medium text-sm">{service.ProductName}</p>
                                <p className="text-xs text-gray-500">₹{service.Price.toFixed(2)}</p>
                              </div>
                              {isServiceSelected(service.prod_id) && (
                                <Badge variant="outline" className="bg-primary/20 border-primary/30">
                                  <Check className="h-3 w-3 mr-1" /> Selected
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ServiceSelectionField;
