
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Artist {
  ArtistId: string; // Changed from number to string for UUID
  ArtistFirstName: string | null;
  ArtistLastName: string | null;
}

export const useBookingArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistId, ArtistFirstName, ArtistLastName')
          .eq('Active', true);

        if (error) {
          console.error("Error fetching artists:", error);
          return;
        }

        // Convert the numeric ArtistId to string if needed
        const artistsWithStringIds = data?.map(artist => ({
          ...artist,
          ArtistId: artist.ArtistId.toString()
        })) || [];

        setArtists(artistsWithStringIds);
      } catch (error) {
        console.error("Error in fetchArtists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return { artists, loading };
};
