
import { Package, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  ProductName: string;
  Qty: number;
  price: number;
}

interface ServicesListProps {
  services: Service[];
}

const ServicesList = ({ services }: ServicesListProps) => {
  // Function to get an icon based on the service name
  const getServiceIcon = (serviceName: string) => {
    const normalizedName = serviceName.toLowerCase();
    
    if (normalizedName.includes("premium") || normalizedName.includes("deluxe")) {
      return <Star className="text-amber-500" size={18} />;
    } else if (normalizedName.includes("package") || normalizedName.includes("bundle")) {
      return <Package className="text-primary" size={18} />;
    } else {
      return <CheckCircle className="text-emerald-500" size={18} />;
    }
  };

  // Determine background color based on service index
  const getCardColor = (index: number) => {
    const colors = [
      "bg-gradient-to-r from-secondary/30 to-secondary/10",
      "bg-gradient-to-r from-primary/20 to-primary/5",
      "bg-gradient-to-r from-amber-100 to-amber-50"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="col-span-2 mt-4 border-t pt-4">
      <p className="text-sm font-medium text-gray-500 mb-3 flex items-center">
        <Package size={16} className="mr-2 text-primary" />
        Services
      </p>
      <div className="space-y-3">
        {services.map((service, index) => (
          <div 
            key={index} 
            className={cn(
              "p-4 rounded-md border shadow-sm transition-all hover:shadow-md",
              getCardColor(index)
            )}
          >
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-white shadow-sm mr-3">
                {getServiceIcon(service.ProductName)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{service.ProductName}</p>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mt-2">
                  <div className="bg-white/50 p-2 rounded">
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-medium">{service.Qty || 1}</p>
                  </div>
                  <div className="bg-white/50 p-2 rounded">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-medium">₹{service.price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-white/50 p-2 rounded">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-medium text-primary">
                      ₹{((service.Qty || 1) * service.price)?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesList;
