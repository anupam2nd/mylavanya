
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

export const useArtistAssignment = (
  bookings: Booking[],
  setBookings: (bookings: Booking[]) => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAssigning, setIsAssigning] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ Username?: string, FirstName?: string, LastName?: string } | null>(null);

  const fetchCurrentUser = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('UserMST')
        .select('Username, FirstName, LastName')
        .eq('id', parseInt(user.id)) // Convert string to number
        .single();
      
      if (error) throw error;
      
      if (data) {
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const handleArtistAssignWithUser = async (booking: Booking, artistId: string): Promise<void> => {
    if (isAssigning) return Promise.resolve();
    
    try {
      setIsAssigning(true);
      
      // If we don't have the current user yet, fetch it
      if (!currentUser) {
        await fetchCurrentUser();
      }
      
      // Convert booking ID to a number if it's a string
      const bookingId = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      // Empty string means unassigning the artist
      if (artistId === "") {
        const { error } = await supabase
          .from('BookMST')
          .update({ 
            ArtistId: null, 
            Assignedto: null,
            AssignedBY: null,
            AssingnedON: null,
            AssignedToEmpCode: null
          })
          .eq('id', bookingId);
          
        if (error) throw error;
        
        // Update the booking in state
        const updatedBookings = bookings.map(b => 
          b.id === booking.id 
            ? { ...b, ArtistId: null, Assignedto: null, AssignedBY: null, AssingnedON: null, AssignedToEmpCode: null } 
            : b
        );
        
        setBookings(updatedBookings);
        
        toast({
          title: "Artist unassigned",
          description: "The artist has been removed from this booking.",
        });
        
        return Promise.resolve();
      }
      
      // Get the artist details including ArtistEmpCode
      const { data: artistData, error: artistError } = await supabase
        .from('ArtistMST')
        .select('ArtistFirstName, ArtistLastName, ArtistEmpCode')
        .eq('ArtistId', parseInt(artistId))
        .single();
      
      if (artistError) throw artistError;
      
      // Format the artist name
      const artistName = artistData 
        ? `${artistData.ArtistFirstName || ''} ${artistData.ArtistLastName || ''}`.trim() || `Artist #${artistId}`
        : `Artist #${artistId}`;
      
      // Convert artistId to number for Supabase
      const artistIdNumber = parseInt(artistId);
      
      // Update the booking with the new artist and their employee code
      const { error } = await supabase
        .from('BookMST')
        .update({ 
          ArtistId: artistIdNumber, 
          Assignedto: artistName,
          AssignedBY: currentUser?.Username || user?.email || 'admin',
          AssingnedON: new Date().toISOString(),
          AssignedToEmpCode: artistData?.ArtistEmpCode || 'UNASSIGNED',
          Status: 'Beautician_assigned'
        })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Update the booking in state
      const updatedBookings = bookings.map(b => 
        b.id === booking.id 
          ? { 
              ...b, 
              ArtistId: artistId,
              Assignedto: artistName,
              AssignedBY: currentUser?.Username || user?.email || 'admin',
              AssingnedON: new Date().toISOString(),
              AssignedToEmpCode: artistData?.ArtistEmpCode || 'UNASSIGNED',
              Status: 'Beautician_assigned'
            } 
          : b
      );
      
      setBookings(updatedBookings);
      
      toast({
        title: "Artist assigned",
        description: `${artistName} has been assigned to this booking.`,
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error assigning artist:", error);
      
      toast({
        variant: "destructive",
        title: "Error assigning artist",
        description: "There was an error assigning the artist.",
      });
      
      return Promise.reject(error);
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    currentUser,
    handleArtistAssignWithUser,
    isAssigning
  };
};
