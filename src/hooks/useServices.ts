
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Service {
  id: string;
  title?: string;
  name?: string;
  price: number;
  category?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useServices = (categoryFilter?: string, sortOrder?: 'asc' | 'desc' | 'none') => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Start with the base query
        let query = supabase
          .from('PriceMST')
          .select('*')
          .eq('active', true);
        
        // Apply category filter if provided
        if (categoryFilter) {
          query = query.eq('Category', categoryFilter);
        }
        
        // Apply sorting if requested
        if (sortOrder === 'asc') {
          query = query.order('Price', { ascending: true });
        } else if (sortOrder === 'desc') {
          query = query.order('Price', { ascending: false });
        } else {
          // Default sorting by category then name
          query = query.order('Category', { ascending: true }).order('ProductName', { ascending: true });
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match the Service interface
        const transformedServices: Service[] = data.map(item => ({
          id: item.prod_id.toString(),
          title: item.ProductName,
          name: item.ProductName,
          price: item.Price || 0,
          category: item.Category,
          description: item.Description
        }));
        
        setServices(transformedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error",
          description: "Failed to load services. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [categoryFilter, sortOrder, toast]);

  return { services, loading };
};
