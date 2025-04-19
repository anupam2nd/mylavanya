
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Artist } from "@/types/artist";

export const useArtistManagement = () => {
  const { toast } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ArtistMST')
        .select('*')
        .order('ArtistId', { ascending: true });

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast({
        title: "Failed to load artists",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (artist: Artist) => {
    try {
      const { error } = await supabase
        .from('ArtistMST')
        .update({ Active: !artist.Active })
        .eq('ArtistId', artist.ArtistId);

      if (error) throw error;

      setArtists(artists.map(a => 
        a.ArtistId === artist.ArtistId 
          ? { ...a, Active: !artist.Active } 
          : a
      ));
      
      toast({
        title: !artist.Active ? "Artist activated" : "Artist deactivated",
        description: `Artist "${artist.ArtistFirstName} ${artist.ArtistLastName}" has been ${!artist.Active ? "activated" : "deactivated"}`,
      });
    } catch (error) {
      console.error('Error updating artist status:', error);
      toast({
        title: "Error",
        description: "Failed to update the artist",
        variant: "destructive",
      });
    }
  };

  const deleteArtist = async (artist: Artist) => {
    try {
      const { error } = await supabase
        .from('ArtistMST')
        .delete()
        .eq('ArtistId', artist.ArtistId);

      if (error) throw error;

      setArtists(artists.filter(a => a.ArtistId !== artist.ArtistId));
      toast({
        title: "Artist deleted",
        description: "The artist has been successfully removed",
      });
      return true;
    } catch (error) {
      console.error('Error deleting artist:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the artist",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    artists,
    loading,
    toggleStatus,
    deleteArtist,
    setArtists
  };
};
