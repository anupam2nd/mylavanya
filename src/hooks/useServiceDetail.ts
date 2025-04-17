
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ServiceDetailData {
  prod_id: number;
  ProductName: string | null;
  Services: string | null;
  Subservice: string | null;
  Description: string | null;
  Price: number;
  Discount: number | null;
  NetPayable: number | null;
  active: boolean;
}

export const useServiceDetail = (serviceId: string | undefined) => {
  const [service, setService] = useState<ServiceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching service with ID:", serviceId);

        if (!serviceId) {
          throw new Error("Service ID is required");
        }
        const serviceIdNumber = parseInt(serviceId);
        if (isNaN(serviceIdNumber)) {
          throw new Error("Invalid service ID");
        }

        const {
          data,
          error
        } = await supabase.from('PriceMST').select('*').eq('prod_id', serviceIdNumber).eq('active', true).single();
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        console.log("Service data:", data);
        setService(data);
      } catch (error) {
        console.error("Error fetching service details:", error);
        setError("Could not load service details or the service may be inactive");
        toast({
          title: "Error",
          description: "Could not load service details or the service may be inactive",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  // Calculate the final price with discount or net payable if available
  const finalPrice = service ? (
    service.NetPayable !== null && service.NetPayable !== undefined 
      ? service.NetPayable 
      : service.Discount 
        ? service.Price - (service.Price * service.Discount / 100) 
        : service.Price
  ) : 0;

  // Create a formatted service name for display
  const formattedServiceName = service ? [
    service.Services,
    service.Subservice,
    service.ProductName
  ].filter(Boolean).join(' - ') : '';

  return {
    service,
    loading,
    error,
    finalPrice,
    formattedServiceName
  };
};
