
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StatusOption {
  status_code: string;
  status_name: string;
  description?: string;
  active?: boolean;
  id?: number;
}

export interface FormattedStatusOption {
  label: string;
  value: string;
}

export const useStatusOptions = () => {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [formattedStatusOptions, setFormattedStatusOptions] = useState<FormattedStatusOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatusOptions();
  }, []);

  const fetchStatusOptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('statusmst')
        .select('status_code, status_name, description, active, id')
        .eq('active', true);

      if (error) {
        console.error("Error fetching status options:", error);
        return;
      }

      setStatusOptions(data || []);
      
      // Format options for select components
      const formatted = (data || []).map(status => ({
        label: status.status_name,
        value: status.status_code
      }));
      
      setFormattedStatusOptions(formatted);
    } catch (error) {
      console.error("Error in fetchStatusOptions:", error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    statusOptions, 
    formattedStatusOptions,
    loading,
    fetchStatusOptions
  };
};
