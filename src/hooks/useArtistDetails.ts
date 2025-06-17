
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ArtistDetail {
  ArtistId: number;
  ArtistFirstName: string | null;
  ArtistLastName: string | null;
  ArtistEmpCode: string | null;
  ArtistPhno: number | null;
  emailid: string | null;
}

export const useArtistDetails = (artistIds?: number[]) => {
  const [artistDetails, setArtistDetails] = useState<Record<number, ArtistDetail>>({});

  const fetchArtistDetails = async (ids: number[]) => {
    if (ids.length === 0) {
      return;
    }

    // Remove duplicates and filter out invalid IDs
    const uniqueArtistIds = [...new Set(ids)].filter(id => !isNaN(id) && id > 0);
    
    if (uniqueArtistIds.length === 0) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ArtistMST')
        .select('ArtistId, ArtistFirstName, ArtistLastName, ArtistEmpCode, ArtistPhno, emailid')
        .in('ArtistId', uniqueArtistIds);

      if (error) throw error;

      if (data) {
        const artistMap = data.reduce((acc, artist) => {
          acc[artist.ArtistId] = artist;
          return acc;
        }, {} as Record<number, ArtistDetail>);
        
        setArtistDetails(prev => ({ ...prev, ...artistMap }));
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const getArtistName = (artistId: number) => {
    const artist = artistDetails[artistId];
    if (!artist) return 'Unknown Artist';
    return `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || 'Unknown Artist';
  };

  const getArtistPhone = (artistId: number) => {
    const artist = artistDetails[artistId];
    return artist?.ArtistPhno?.toString() || 'N/A';
  };

  // Auto-fetch when artistIds are provided
  useEffect(() => {
    if (artistIds && artistIds.length > 0) {
      fetchArtistDetails(artistIds);
    }
  }, [artistIds]);

  return { artistDetails, fetchArtistDetails, getArtistName, getArtistPhone };
};
