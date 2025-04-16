
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
          // User ID is now a UUID string, no need to parse as integer
          const userId = authSession.session.user.id;
          
          const { data, error } = await supabase
            .from('UserMST')
            .select('Username, FirstName, LastName')
            .eq('id', userId)
            .single();
              
          if (!error && data) {
            setCurrentUser(data);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const handleArtistAssignWithUser = async (booking: Booking, artistId: string) => {
    try {
      // Use artistId directly as string
      if (!artistId) {
        throw new Error("Invalid artist ID");
      }
      
      const { data, error: artistError } = await supabase
        .from('ArtistMST')
        .select('ArtistFirstName, ArtistLastName')
        .eq('ArtistId', artistId)
        .single();
      
      if (artistError) {
        throw artistError;
      }
      
      const artistName = `${data.ArtistFirstName || ''} ${data.ArtistLastName || ''}`.trim();
      
      const { error } = await supabase
        .from('BookMST')
        .update({
          ArtistId: artistId,
          Assignedto: artistName,
          AssignedBY: currentUser?.FirstName || currentUser?.Username || 'Admin',
          AssingnedON: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;
      
      const updatedBookings = bookings.map(b => 
        b.id === booking.id 
          ? { 
              ...b, 
              ArtistId: artistId,
              Assignedto: artistName,
              AssignedBY: currentUser?.FirstName || currentUser?.Username || 'Admin',
              AssingnedON: new Date().toISOString()
            } 
          : b
      );
      
      setBookings(updatedBookings);
      
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
