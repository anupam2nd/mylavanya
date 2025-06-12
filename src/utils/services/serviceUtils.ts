
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/components/admin/services/ServiceForm";

export const getNextProdId = async (): Promise<number> => {
  try {
    // Get the maximum prod_id value from the PriceMST table
    const { data, error } = await supabase
      .from('PriceMST')
      .select('prod_id')
      .order('prod_id', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching max prod_id:', error);
      throw error;
    }
    
    // If there are no records, start with 1, otherwise increment the max value
    let nextId = 1;
    if (data && data.length > 0) {
      nextId = data[0].prod_id + 1;
    }
    
    return nextId;
  } catch (error) {
    console.error('Error calculating next prod_id:', error);
    throw error;
  }
};

export const filterServices = (
  services: Service[],
  searchQuery: string,
  activeFilter: string,
  categoryFilter?: string
): Service[] => {
  let result = [...services];
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      service => 
        service.Services.toLowerCase().includes(query) ||
        (service.ProductName && service.ProductName.toLowerCase().includes(query)) ||
        (service.Description && service.Description.toLowerCase().includes(query))
    );
  }
  
  if (activeFilter !== "all") {
    const isActive = activeFilter === "active";
    result = result.filter(service => service.active === isActive);
  }

  if (categoryFilter && categoryFilter !== "all") {
    result = result.filter(service => service.Category === categoryFilter);
  }
  
  return result;
};
