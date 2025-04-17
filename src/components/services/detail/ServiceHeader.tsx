
import React from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNavigate } from "react-router-dom";

interface ServiceHeaderProps {
  serviceName: string | null;
  serviceType: string | null;
  subservice: string | null;
  price: number;
  discount: number | null;
  finalPrice: number;
  netPayable: number | null;
}

const ServiceHeader: React.FC<ServiceHeaderProps> = ({
  serviceName,
  serviceType,
  subservice,
  price,
  discount,
  finalPrice,
  netPayable
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-violet-100 to-purple-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate("/services")} className="mb-4">
          ← Back to Services
        </Button>
        
        <div className="flex flex-col space-y-2">
          <div>
            <StatusBadge status={serviceType} className="text-lg font-bold px-4 py-2 bg-primary/20 text-primary">
              {serviceType}
            </StatusBadge>
          </div>
          {subservice && (
            <div className="text-xl font-medium text-gray-700">{subservice}</div>
          )}
          {serviceName && (
            <div className="text-base text-gray-500">{serviceName}</div>
          )}
          
          {discount || (netPayable !== null && netPayable !== undefined) ? (
            <div className="flex items-center space-x-2 mt-1">
              <span className="line-through text-gray-500">₹{price.toFixed(2)}</span>
              <span className="text-lg font-medium text-primary">₹{finalPrice.toFixed(2)}</span>
              {discount && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                  {discount}% OFF
                </span>
              )}
            </div>
          ) : (
            <p className="text-lg font-medium text-primary mt-1">₹{price.toFixed(2)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceHeader;
