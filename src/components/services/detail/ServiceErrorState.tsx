
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ServiceErrorStateProps {
  error?: string | null;
  isNotFound?: boolean;
}

const ServiceErrorState: React.FC<ServiceErrorStateProps> = ({ 
  error, 
  isNotFound = false 
}) => {
  const navigate = useNavigate();
  
  const message = isNotFound
    ? "The service you are looking for does not exist."
    : error || "Could not load service details";
    
  const title = isNotFound
    ? "Service not found"
    : "Error Loading Service";

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-medium mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <Button onClick={() => navigate("/services")}>
        Back to Services
      </Button>
    </div>
  );
};

export default ServiceErrorState;
