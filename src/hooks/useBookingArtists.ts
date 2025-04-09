
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Artist {
  ArtistId: number;
  ArtistFirstName: string;
  ArtistLastName: string;
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

        setArtists(data || []);
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
