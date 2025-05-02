
import React from "react";
import { SelectedService } from "../types/ServiceTypes";
import SelectedServiceItem from "./SelectedServiceItem";

interface SelectedServicesListProps {
  selectedServices: SelectedService[];
  onRemoveService: (serviceId: number) => void;
  onUpdateQuantity: (serviceId: number, quantity: number) => void;
}

const SelectedServicesList: React.FC<SelectedServicesListProps> = ({ 
  selectedServices, 
  onRemoveService, 
  onUpdateQuantity 
}) => {
  // Calculate total price including quantities with original prices
  const totalOriginalPrice = selectedServices.reduce((sum, service) => 
    sum + ((service.originalPrice || service.price) * (service.quantity || 1)), 0);
    
  // Calculate total price including quantities with discounted prices
  const totalNetPrice = selectedServices.reduce((sum, service) => 
    sum + (service.price * (service.quantity || 1)), 0);

  return (
    <div className="border rounded-md p-3 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
        <h4 className="text-sm font-medium">Services in this booking</h4>
        <div className="text-sm font-semibold mt-1 sm:mt-0">
          {totalOriginalPrice !== totalNetPrice ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="line-through text-gray-500">₹{totalOriginalPrice.toFixed(2)}</span>
              <span className="text-primary">₹{totalNetPrice.toFixed(2)}</span>
            </div>
          ) : (
            <span>Total: ₹{totalNetPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
      
      {selectedServices.length > 0 ? (
        <div className="space-y-2">
          {selectedServices.map(service => (
            <SelectedServiceItem 
              key={service.id}
              service={service} 
              onRemove={onRemoveService} 
              onQuantityChange={onUpdateQuantity} 
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm py-2">No services selected. Please add at least one service.</p>
      )}
    </div>
  );
};

export default SelectedServicesList;
