
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
    queryKey: ['artist-applications', user?.id],
    queryFn: async () => {
      console.log('Fetching artist applications...');
      console.log('Auth user from context:', user);
      console.log('Is authenticated:', isAuthenticated);
      
      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated in context');
      }
      
      // Check user role
      if (!['admin', 'superadmin', 'controller'].includes(user.role)) {
        throw new Error('User not authorized to view artist applications');
      }
      
      // For admin users, we'll use the service role to bypass RLS temporarily
      console.log('User role verified:', user.role);
      
      // Check both context auth and Supabase auth
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      console.log('Supabase user:', supabaseUser?.id);
      
      // If no Supabase user but we have a valid admin user, proceed anyway
      if (!supabaseUser && user.role === 'superadmin') {
        console.log('No Supabase session, but proceeding as superadmin');
      }
      
      try {
        const { data, error } = await supabase
          .from('ArtistApplication')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching artist applications:', error);
          
          // If RLS is blocking, try with a different approach
          if (error.code === 'PGRST301' || error.message.includes('row-level security')) {
            console.log('RLS blocking access, user might not have proper Supabase session');
            throw new Error('Authentication session expired. Please try refreshing the page.');
          }
          
          throw error;
        }

        console.log('Fetched applications:', data?.length || 0, 'applications');
        console.log('Sample application data:', data?.[0]);
        return data as ArtistApplication[];
      } catch (error) {
        console.error('Query failed:', error);
        throw error;
      }
    },
    enabled: !!user && isAuthenticated && ['admin', 'superadmin', 'controller'].includes(user?.role || ''),
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (error.message.includes('not authenticated') || error.message.includes('not authorized')) {
        return false;
      }
      return failureCount < 2;
    }
  });
};
