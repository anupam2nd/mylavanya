
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ArtistDetails {
  ArtistFirstName?: string;
  ArtistLastName?: string;
  ArtistPhno?: number;
  emailid?: string;
}

export const useArtistDetails = (artistIds: (number | undefined)[]) => {
  const [artistDetails, setArtistDetails] = useState<Record<number, ArtistDetails>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        const filteredIds = artistIds.filter((id): id is number => id !== undefined);
        
        if (filteredIds.length === 0) return;
        
        const uniqueArtistIds = [...new Set(filteredIds)];
        
        setLoading(true);
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistId, ArtistFirstName, ArtistLastName, ArtistPhno, emailid')
          .in('ArtistId', uniqueArtistIds);

        if (error) throw error;

        const artistMap: Record<number, ArtistDetails> = {};
        data?.forEach(artist => {
          if (artist.ArtistId) {
            artistMap[artist.ArtistId] = {
              ArtistFirstName: artist.ArtistFirstName,
              ArtistLastName: artist.ArtistLastName,
              ArtistPhno: artist.ArtistPhno,
              emailid: artist.emailid
            };
          }
        });

        setArtistDetails(artistMap);
      } catch (error) {
        console.error('Error fetching artist details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (artistIds.length > 0) {
      fetchArtistDetails();
    }
  }, [artistIds]);

  const getArtistName = (artistId?: number) => {
    if (!artistId || !artistDetails[artistId]) return 'Not assigned';
    const artist = artistDetails[artistId];
    return `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || 'Not available';
  };

  const getArtistPhone = (artistId?: number) => {
    if (!artistId || !artistDetails[artistId]) return '';
    return artistDetails[artistId].ArtistPhno || '';
  };

  return {
    artistDetails,
    loading: loading,
    getArtistName,
    getArtistPhone
  };
};
