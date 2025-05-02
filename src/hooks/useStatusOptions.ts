
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Helper function to normalize status for display and filtering
const formatStatusValue = (statusCode: string) => {
  return statusCode.toLowerCase().replace(/\s+/g, '_');
};

export const useStatusOptions = () => {
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([]);
  const [formattedStatusOptions, setFormattedStatusOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name')
          .eq('active', true);

        if (error) {
          throw error;
        }

        if (data) {
          // Create two versions of status options:
          // 1. Original status codes for internal use
          const options = data.map(status => ({
            value: status.status_code,
            label: status.status_name
          }));
          setStatusOptions(options);

          // 2. Formatted status codes for UI display and filtering
          const formattedOptions = data.map(status => ({
            value: formatStatusValue(status.status_code),
            label: status.status_name
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
