
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StatusOption {
  status_code: string;
  status_name: string;
  description?: string;
  active: boolean;
}

export interface FormattedStatusOption {
  value: string;
  label: string;
}

export const useStatusOptions = () => {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [formattedStatusOptions, setFormattedStatusOptions] = useState<FormattedStatusOption[]>([]);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name, description, active')
          .eq('active', true);

        if (error) throw error;
        setStatusOptions(data || []);
        
        // Transform data to match expected format for BookingFilters
        setFormattedStatusOptions(
          (data || []).map(option => ({
            value: option.status_code,
            label: option.status_name
          }))
        );
      } catch (error) {
        console.error('Error fetching status options:', error);
      }
    };

    fetchStatusOptions();
  }, []);

  return { statusOptions, formattedStatusOptions };
};
