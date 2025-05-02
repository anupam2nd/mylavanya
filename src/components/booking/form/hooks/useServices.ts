
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "../types/ServiceTypes";

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  return {
    services,
    isLoading
  };
};
