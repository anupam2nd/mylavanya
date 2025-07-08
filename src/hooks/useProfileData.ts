
import { useState, useEffect } from 'react';
import { ProfileFormData, ChildDetail } from '@/types/profile';
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
          // Fetch from MemberMST table for members
          const { data, error } = await supabase
            .from('MemberMST')
            .select('*')
            .eq('uuid', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (data) {
            // Parse children details from MemberMST
            let childrenDetails: ChildDetail[] = [];
            if (data.ChildrenDetails) {
              try {
                if (Array.isArray(data.ChildrenDetails)) {
                  childrenDetails = (data.ChildrenDetails as unknown) as ChildDetail[];
                } else if (typeof data.ChildrenDetails === 'string') {
                  childrenDetails = JSON.parse(data.ChildrenDetails) as ChildDetail[];
                }
              } catch (e) {
                console.warn('Failed to parse children_details:', e);
                childrenDetails = [];
              }
            }

            setProfileData({
              email: data.MemberEmailId || user.email,
              firstName: data.MemberFirstName || '',
              lastName: data.MemberLastName || '',
              phone: data.MemberPhNo || '',
              maritalStatus: data.MaritalStatus || false,
              spouseName: data.SpouseName || '',
              hasChildren: data.HasChildren || false,
              numberOfChildren: data.NumberOfChildren || 0,
              childrenDetails: childrenDetails
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
