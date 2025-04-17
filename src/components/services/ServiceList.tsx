
import React from "react";
import { useServices } from "@/hooks/useServices";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface ServiceListProps {
  categoryFilter?: string;
  sortOrder?: 'asc' | 'desc' | 'none';
}

const ServiceList: React.FC<ServiceListProps> = ({ categoryFilter, sortOrder = 'none' }) => {
  const { services, loading } = useServices(categoryFilter, sortOrder);
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading services...</div>;
  }

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            id={service.id}
            title={service.title || service.name || "Unnamed Service"}
            price={service.price || 0}
            category={service.category}
            description={service.description}
            onClick={() => handleServiceClick(service.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ServiceList;
