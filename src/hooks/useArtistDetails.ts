
import { useState, useEffect, useRef } from "react";
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
  const previousArtistIdsRef = useRef<string>('');

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        // Filter out undefined or null IDs
        const filteredIds = artistIds.filter((id): id is number => 
          id !== undefined && id !== null && !isNaN(Number(id)));
        
        // If there are no valid IDs, return early
        if (filteredIds.length === 0) {
          console.log("No valid artist IDs to fetch");
          return;
        }
        
        // Use Set to ensure we only have unique IDs
        const uniqueArtistIds = [...new Set(filteredIds)];
        
        // Stringify the array for comparison
        const currentArtistIdsString = JSON.stringify(uniqueArtistIds.sort());
        
        // Check if the artist IDs have changed
        if (previousArtistIdsRef.current === currentArtistIdsString) {
          console.log("Artist IDs haven't changed, skipping fetch");
          return;
        }
        
        previousArtistIdsRef.current = currentArtistIdsString;
        
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

    fetchArtistDetails();
  }, [artistIds]);

  const getArtistName = (artistId?: number) => {
    // Make sure artistId is a number
    const numericArtistId = artistId ? Number(artistId) : undefined;
    
    if (!numericArtistId || !artistDetails[numericArtistId]) {
      // Check if there's a booking status that indicates an artist was assigned even if no ID
      return 'Not assigned';
    }
    
    const artist = artistDetails[numericArtistId];
    return `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || 'Not available';
  };

  const getArtistPhone = (artistId?: number): string => {
    // Make sure artistId is a number
    const numericArtistId = artistId ? Number(artistId) : undefined;
    
    if (!numericArtistId || !artistDetails[numericArtistId]) return '';
    return artistDetails[numericArtistId].ArtistPhno ? artistDetails[numericArtistId].ArtistPhno!.toString() : '';
  };

  return {
    artistDetails,
    loading,
    getArtistName,
    getArtistPhone
  };
};
