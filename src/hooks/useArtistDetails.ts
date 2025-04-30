
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ArtistDetails {
  ArtistFirstName?: string;
  ArtistLastName?: string;
  ArtistPhno?: number;
  emailid?: string;
  ArtistEmpCode?: string;
}

export const useArtistDetails = (artistIds: (number | undefined)[]) => {
  const [artistDetails, setArtistDetails] = useState<Record<number, ArtistDetails>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        // Filter out undefined or null IDs
        const filteredIds = artistIds.filter((id): id is number => 
          id !== undefined && id !== null && !isNaN(id));
        
        // If there are no valid IDs, return early
        if (filteredIds.length === 0) {
          console.log("No valid artist IDs to fetch");
          return;
        }
        
        // Use Set to ensure we only have unique IDs
        const uniqueArtistIds = [...new Set(filteredIds)];
        
        console.log("Fetching artist details for IDs:", uniqueArtistIds);
        
        setLoading(true);
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistId, ArtistFirstName, ArtistLastName, ArtistPhno, emailid, ArtistEmpCode')
          .in('ArtistId', uniqueArtistIds);

        if (error) {
          console.error('Error fetching artist details:', error);
          return;
        }

        console.log("Artist details fetched:", data);
        
        const artistMap: Record<number, ArtistDetails> = {};
        data?.forEach(artist => {
          if (artist.ArtistId) {
            artistMap[artist.ArtistId] = {
              ArtistFirstName: artist.ArtistFirstName,
              ArtistLastName: artist.ArtistLastName,
              ArtistPhno: artist.ArtistPhno,
              emailid: artist.emailid,
              ArtistEmpCode: artist.ArtistEmpCode
            };
          }
        });

        setArtistDetails(artistMap);
      } catch (error) {
        console.error('Error in artist details fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    // Deduplicate and filter out invalid IDs before triggering the fetch
    const validIds = [...new Set(artistIds.filter(id => 
      id !== undefined && id !== null && !isNaN(id)
    ))];
    
    // Only trigger the fetch if the valid IDs array has changed
    if (validIds.length > 0) {
      fetchArtistDetails();
    }
  }, [JSON.stringify(artistIds)]); // Use JSON.stringify to compare array contents

  const getArtistName = (artistId?: number) => {
    if (!artistId || !artistDetails[artistId]) return 'Not assigned';
    const artist = artistDetails[artistId];
    return `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || 'Not available';
  };

  const getArtistPhone = (artistId?: number): string => {
    if (!artistId || !artistDetails[artistId]) return '';
    return artistDetails[artistId].ArtistPhno ? artistDetails[artistId].ArtistPhno!.toString() : '';
  };

  return {
    artistDetails,
    loading: loading,
    getArtistName,
    getArtistPhone
  };
};
