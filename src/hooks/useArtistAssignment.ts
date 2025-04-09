
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";

export const useArtistAssignment = (bookings: Booking[], setBookings: React.Dispatch<React.SetStateAction<Booking[]>>) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<{ Username?: string, FirstName?: string, LastName?: string } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: authSession } = await supabase.auth.getSession();
        
        if (authSession?.session?.user?.id) {
          const userId = parseInt(authSession.session.user.id, 10);
          
          if (!isNaN(userId)) {
            const { data, error } = await supabase
              .from('UserMST')
              .select('Username, FirstName, LastName')
              .eq('id', userId)
              .single();
              
            if (!error && data) {
              setCurrentUser(data);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const handleArtistAssignWithUser = async (booking: Booking, artistId: number, artists: Artist[]) => {
    try {
      // Find the selected artist
      const selectedArtist = artists.find(artist => artist.ArtistId === artistId);
      if (!selectedArtist) return;

      const artistName = `${selectedArtist.ArtistFirstName || ''} ${selectedArtist.ArtistLastName || ''}`.trim();
      
      const { error } = await supabase
        .from('BookMST')
        .update({ 
          ArtistId: artistId,
          Assignedto: artistName,
          AssingnedON: new Date().toISOString(),
          AssignedBY: currentUser?.FirstName || currentUser?.Username || 'User'
        })
        .eq('id', booking.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to assign artist",
          description: error.message,
        });
        return;
      }

      // Update local state
      const bookingIndex = bookings.findIndex(b => b.id === booking.id);
      if (bookingIndex !== -1) {
        const updatedBooking = {
          ...booking,
          ArtistId: artistId,
          Assignedto: artistName,
          AssignedBY: currentUser?.FirstName || currentUser?.Username || 'User',
          AssingnedON: new Date().toISOString()
        };
        
        const updatedBookings = [...bookings];
        updatedBookings[bookingIndex] = updatedBooking;
        setBookings(updatedBookings);
      }

      toast({
        title: "Artist assigned",
        description: `Booking assigned to ${artistName}`,
      });
    } catch (error) {
      console.error("Error assigning artist:", error);
      toast({
        variant: "destructive",
        title: "Error assigning artist",
        description: "An unexpected error occurred",
      });
    }
  };

  return { 
    currentUser,
    handleArtistAssignWithUser 
  };
};
