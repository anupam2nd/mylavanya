
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";
import { SelectedService } from "../types/ServiceTypes";

interface SelectedServiceItemProps {
  service: SelectedService;
  onRemove: (serviceId: number) => void;
  onQuantityChange: (serviceId: number, quantity: number) => void;
}

const SelectedServiceItem: React.FC<SelectedServiceItemProps> = ({ 
  service, 
  onRemove, 
  onQuantityChange 
}) => {
  return (
    <div 
      key={service.id}
      className="flex items-center justify-between bg-white p-2 rounded-md border"
    >
      <div className="flex-grow">
        <p className="font-medium text-sm">{service.name}</p>
        <div className="text-sm text-gray-500">
          {service.originalPrice && service.originalPrice !== service.price ? (
            <div className="flex flex-wrap items-center gap-1">
              <span className="line-through">₹{service.originalPrice.toFixed(2)}</span>
              <span className="text-primary">₹{service.price.toFixed(2)}</span>
              <span>× {service.quantity || 1} =</span>
              <span className="font-medium text-primary">₹{((service.price * (service.quantity || 1))).toFixed(2)}</span>
            </div>
          ) : (
            <p>₹{service.price.toFixed(2)} × {service.quantity || 1} = ₹{((service.price * (service.quantity || 1))).toFixed(2)}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <div className="flex items-center mr-2 border rounded-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => onQuantityChange(service.id, (service.quantity || 1) - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={service.quantity || 1}
            onChange={(e) => onQuantityChange(service.id, parseInt(e.target.value) || 1)}
            className="h-8 w-12 text-center border-0 rounded-none"
            min={1}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => onQuantityChange(service.id, (service.quantity || 1) + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(service.id)}
        >
          <Trash2 className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
};

export default SelectedServiceItem;
