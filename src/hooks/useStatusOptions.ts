
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StatusOption {
  status_code: string;
  status_name: string;
}

export const useStatusOptions = () => {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name');

        if (error) throw error;
        setStatusOptions(data || []);
      } catch (error) {
        console.error('Error fetching status options:', error);
      }
    };

    fetchStatusOptions();
  }, []);

  return { statusOptions };
};
