
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

export const useUserBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      setLoading(true);
      try {
        let query = supabase
          .from('BookMST')
          .select('*')
          .order('Booking_date', { ascending: false });
        
        if (user?.role === 'artist') {
          const artistId = parseInt(user.id, 10);
          if (!isNaN(artistId)) {
            console.log("Filtering bookings by artist ID:", artistId);
            query = query.eq('ArtistId', artistId);
          }
        } 
        else if (user?.role === 'member') {
          console.log("Filtering bookings by member email:", user.email);
          query = query.eq('email', user.email);
        }
        else if (user?.role === 'admin') {
          console.log("Showing all bookings for admin");
        }
        
        query = query.order('Booking_date', { ascending: false });
        
        const { data, error } = await query;

        if (error) throw error;
        console.log("Bookings fetched:", data?.length || 0);

        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Failed to load bookings",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toast, user]);

  return { bookings, setBookings, loading };
};
