
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { BookingFormValues } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Check, Trash2, PlusCircle, Asterisk, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface Service {
  prod_id: number;
  ProductName: string;
  Price: number;
  Services: string;
  Subservice: string;
  NetPayable: number | null;
  Discount: number | null;
}

const ServiceSelectionField = ({ initialSelectedService }: { initialSelectedService?: { id: number; name: string; price: number; quantity?: number } }) => {
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
          .select('prod_id, ProductName, Price, Services, Subservice, NetPayable, Discount')
          .eq('active', true) // Only fetch active services
          .order('Services');
          
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
      form.setValue("selectedServices", [{
        id: initialSelectedService.id,
        name: initialSelectedService.name,
        price: initialSelectedService.price,
        quantity: initialSelectedService.quantity || 1
      }]);
    }
  }, [initialSelectedService, form]);

  // Format service name as "Services - Subservice - ProductName"
  const formatServiceName = (service: Service) => {
    let parts = [];
    if (service.Services) parts.push(service.Services);
    if (service.Subservice) parts.push(service.Subservice);
    if (service.ProductName) parts.push(service.ProductName);
    
    return parts.join(' - ');
  };

  // Get final price (NetPayable or calculated discount price)
  const getFinalPrice = (service: Service) => {
    if (service.NetPayable !== null && service.NetPayable !== undefined) {
      return service.NetPayable;
    } else if (service.Discount) {
      return service.Price - (service.Price * service.Discount / 100);
    } else {
      return service.Price;
    }
  };
  
  const handleAddService = (service: Service) => {
    const currentServices = form.getValues("selectedServices") || [];
    const finalPrice = getFinalPrice(service);
    const serviceName = formatServiceName(service);
    
    // Check if service already exists in the selected list
    if (!currentServices.some(s => s.id === service.prod_id)) {
      form.setValue("selectedServices", [
        ...currentServices,
        {
          id: service.prod_id,
          name: serviceName,
          price: finalPrice,
          quantity: 1
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

  const updateQuantity = (serviceId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const currentServices = form.getValues("selectedServices") || [];
    const updatedServices = currentServices.map(service => 
      service.id === serviceId ? { ...service, quantity: newQuantity } : service
    );
    
    form.setValue("selectedServices", updatedServices);
  };
  
  const isServiceSelected = (serviceId: number) => {
    return selectedServices.some(s => s.id === serviceId);
  };
  
  // Calculate total price including quantities
  const totalPrice = selectedServices.reduce((sum, service) => 
    sum + (service.price * (service.quantity || 1)), 0);
  
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
                        <div className="flex-grow">
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-sm text-gray-500">₹{service.price.toFixed(2)} × {service.quantity || 1} = ₹{((service.price * (service.quantity || 1))).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center mr-2 border rounded-md">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() => updateQuantity(service.id, (service.quantity || 1) - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={service.quantity || 1}
                              onChange={(e) => updateQuantity(service.id, parseInt(e.target.value) || 1)}
                              className="h-8 w-12 text-center border-0 rounded-none"
                              min={1}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() => updateQuantity(service.id, (service.quantity || 1) + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
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
                          {services.map(service => {
                            const formattedName = formatServiceName(service);
                            const finalPrice = getFinalPrice(service);
                            
                            return (
                              <div
                                key={service.prod_id}
                                className={cn(
                                  "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100",
                                  isServiceSelected(service.prod_id) && "bg-primary/10"
                                )}
                                onClick={() => handleAddService(service)}
                              >
                                <div>
                                  <p className="font-medium text-sm">{formattedName}</p>
                                  <p className="text-xs text-gray-500">₹{finalPrice.toFixed(2)}</p>
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
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ServiceSelectionField;
