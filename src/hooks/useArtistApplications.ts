
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ArtistApplication {
  id: string;
  full_name: string;
  phone_no: string;
  email?: string;
  application_date: string;
  status: string;
  branch_name?: string;
  created_at: string;
}

export const useArtistApplications = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['artist-applications'],
    queryFn: async () => {
      console.log('Fetching artist applications...');
      console.log('Auth user from context:', user);
      console.log('Is authenticated:', isAuthenticated);
      
      // Check both context auth and Supabase auth
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      console.log('Supabase user:', supabaseUser?.id);
      
      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated in context');
      }
      
      if (!supabaseUser) {
        throw new Error('User not authenticated in Supabase');
      }
      
      const { data, error } = await supabase
        .from('ArtistApplication')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching artist applications:', error);
        throw error;
      }

      console.log('Fetched applications:', data?.length || 0, 'applications');
      console.log('Sample application data:', data?.[0]);
      return data as ArtistApplication[];
    },
    enabled: isAuthenticated && !!user,
  });
};
