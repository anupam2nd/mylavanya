
import React from "react";
import { useServices } from "@/hooks/useServices";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ScrollArea } from "@/components/ui/scroll-area";

const ServiceList = () => {
  const { services, loading } = useServices();

  if (loading) {
    return <div>Loading services...</div>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            id={service.id.toString()}
            title={service.title || service.name || "Unnamed Service"}
            price={service.price || 0}
            category={service.category}
            description={service.description}
            onClick={() => console.log("Service clicked:", service)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ServiceList;
