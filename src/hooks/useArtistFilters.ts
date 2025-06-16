
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "./useBookings";

interface ArtistDetails {
  ArtistId: number;
  ArtistFirstName: string;
  ArtistLastName: string;
  ArtistEmpCode: string;
}

export const useArtistFilters = (bookings: Booking[]) => {
  const [artistFilter, setArtistFilter] = useState<string>("all");
  const [artistDetails, setArtistDetails] = useState<Record<number, ArtistDetails>>({});
  const [loading, setLoading] = useState(false);

  // Get unique artist IDs from bookings
  const artistIds = useMemo(() => {
    const ids = bookings
      .map(booking => booking.ArtistId)
      .filter((id): id is number => id !== null && id !== undefined && !isNaN(Number(id)));
    return [...new Set(ids)];
  }, [bookings]);

  // Fetch artist details
  useEffect(() => {
    const fetchArtistDetails = async () => {
      if (artistIds.length === 0) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistId, ArtistFirstName, ArtistLastName, ArtistEmpCode')
          .in('ArtistId', artistIds);

        if (error) {
          console.error('Error fetching artist details:', error);
          return;
        }

        const artistMap: Record<number, ArtistDetails> = {};
        data?.forEach(artist => {
          if (artist.ArtistId) {
            artistMap[artist.ArtistId] = {
              ArtistId: artist.ArtistId,
              ArtistFirstName: artist.ArtistFirstName || '',
              ArtistLastName: artist.ArtistLastName || '',
              ArtistEmpCode: artist.ArtistEmpCode || ''
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

  // Create artist options for filter dropdown
  const artistOptions = useMemo(() => {
    return Object.values(artistDetails).map(artist => ({
      value: artist.ArtistId.toString(),
      label: `${artist.ArtistFirstName} ${artist.ArtistLastName}`.trim() || 'Unknown Artist',
      empCode: artist.ArtistEmpCode || 'N/A'
    }));
  }, [artistDetails]);

  // Filter bookings by selected artist
  const filteredByArtist = useMemo(() => {
    if (artistFilter === "all") return bookings;
    
    const selectedArtistId = parseInt(artistFilter, 10);
    return bookings.filter(booking => 
      booking.ArtistId === selectedArtistId
    );
  }, [bookings, artistFilter]);

  const clearArtistFilter = () => {
    setArtistFilter("all");
  };

  const getArtistName = (artistId?: number) => {
    if (!artistId || !artistDetails[artistId]) return 'Not assigned';
    const artist = artistDetails[artistId];
    return `${artist.ArtistFirstName} ${artist.ArtistLastName}`.trim() || 'Unknown Artist';
  };

  return {
    artistFilter,
    setArtistFilter,
    artistOptions,
    filteredByArtist,
    clearArtistFilter,
    getArtistName,
    loading: loading
  };
};
