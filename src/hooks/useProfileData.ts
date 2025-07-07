
import { useState, useEffect } from 'react';
import { ProfileFormData } from '@/types/profile';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export const useProfileData = (user: User | null) => {
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (user.role === 'member') {
          // Fetch from member_profiles table for Supabase auth members
          const { data, error } = await supabase
            .from('member_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (data) {
            setProfileData({
              email: data.email || user.email,
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              phone: data.phone_number || '',
              maritalStatus: data.marital_status || false,
              spouseName: data.spouse_name || '',
              hasChildren: data.has_children || false,
              numberOfChildren: data.number_of_children || 0,
              childrenDetails: data.children_details || []
            });
          } else {
            // Create default profile data if no profile exists
            setProfileData({
              email: user.email,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              phone: '',
              maritalStatus: false,
              spouseName: '',
              hasChildren: false,
              numberOfChildren: 0,
              childrenDetails: []
            });
          }
        } else {
          // For admin/artist users, create basic profile data from user info
          setProfileData({
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  return {
    profileData,
    isLoading,
    error,
    refetch: () => {
      if (user) {
        setIsLoading(true);
        // Re-trigger the effect by updating a dependency
      }
    }
  };
};
