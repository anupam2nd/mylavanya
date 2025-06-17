
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export const useArtistLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArtistLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch artist data by email instead of employee code
      const { data: artistData, error: artistError } = await supabase
        .from('ArtistMST')
        .select('*')
        .eq('emailid', email)
        .eq('Active', true)
        .single();

      if (artistError || !artistData) {
        setError('Invalid email or account is not active');
        return false;
      }

      if (!artistData.password) {
        setError('Password not set for this account. Please contact administrator.');
        return false;
      }

      // Compare plain text password directly (no hashing for artists)
      if (artistData.password !== password) {
        setError('Invalid password');
        return false;
      }

      // Create user object for artist
      const artistUser = {
        id: artistData.ArtistId.toString(),
        email: artistData.emailid || `artist${artistData.ArtistId}@company.com`,
        role: 'artist',
        firstName: artistData.ArtistFirstName || '',
        lastName: artistData.ArtistLastName || ''
      };

      return artistUser;
    } catch (error) {
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleArtistLogin, loading, error };
};
