
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ArtistDetail {
  ArtistId: number;
  ArtistFirstName: string | null;
  ArtistLastName: string | null;
  ArtistEmpCode: string | null;
  ArtistPhno: number | null;
  emailid: string | null;
}

export const useArtistDetails = () => {
  const [artistDetails, setArtistDetails] = useState<Record<number, ArtistDetail>>({});

  const fetchArtistDetails = async (artistIds: number[]) => {
    if (artistIds.length === 0) {
      return;
    }

    // Remove duplicates and filter out invalid IDs
    const uniqueArtistIds = [...new Set(artistIds)].filter(id => !isNaN(id) && id > 0);
    
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
        
        setArtistDetails(artistMap);
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

  return { artistDetails, fetchArtistDetails, getArtistName, getArtistPhone };
};
