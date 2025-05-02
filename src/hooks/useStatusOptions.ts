
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define a proper interface for status options
export interface StatusOption {
  value: string;        // For form controls
  label: string;        // For display
  status_code: string;  // Original status code
  status_name: string;  // Original status name  
  description?: string; // Optional description
  active?: boolean;     // Optional active flag
  id?: number;          // Optional database ID
}

// Helper function to normalize status for display and filtering
const formatStatusValue = (statusCode: string) => {
  return statusCode.toLowerCase().replace(/\s+/g, '_');
};

export const useStatusOptions = () => {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [formattedStatusOptions, setFormattedStatusOptions] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('statusmst')
          .select('*')
          .eq('active', true);

        if (error) {
          throw error;
        }

        if (data) {
          // Create status options with both original and formatted properties
          const options = data.map(status => ({
            value: status.status_code,
            label: status.status_name,
            status_code: status.status_code,
            status_name: status.status_name,
            description: status.description,
            active: status.active,
            id: status.id
          }));
          setStatusOptions(options);

          // Create formatted status options for UI display and filtering
          const formattedOptions = data.map(status => ({
            value: formatStatusValue(status.status_code),
            label: status.status_name,
            status_code: status.status_code,
            status_name: status.status_name,
            description: status.description,
            active: status.active,
            id: status.id
          }));
          setFormattedStatusOptions(formattedOptions);

          console.log("Status options loaded:", options);
          console.log("Formatted status options:", formattedOptions);
        }
      } catch (err) {
        console.error('Error fetching status options:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatusOptions();
  }, []);

  return {
    statusOptions,
    formattedStatusOptions,
    loading,
    error
  };
};
