
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Booking } from "./useBookings";

export const useUserBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ email_id?: string, FirstName?: string, LastName?: string } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: authSession } = await supabase.auth.getSession();
        
        if (authSession?.session?.user?.id) {
          const userId = parseInt(authSession.session.user.id, 10);
          
          if (!isNaN(userId)) {
            const { data, error } = await supabase
              .from('UserMST')
              .select('email_id, FirstName, LastName')
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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('BookMST').select('*');
        
        // For artist role, filter bookings by ArtistId
        if (user?.role === 'artist') {
          const artistId = parseInt(user.id, 10);
          if (!isNaN(artistId)) {
            console.log("Filtering bookings by artist ID:", artistId);
            query = query.eq('ArtistId', artistId);
          }
        } 
        // For member role, filter bookings by email
        else if (user?.role === 'member' && user?.email) {
          console.log("Filtering bookings by member email:", user.email);
          query = query.eq('email', user.email);
        }
        // For admin, superadmin, and controller roles, show all bookings (no filter)
        else if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'controller') {
          console.log("Admin/Controller user - showing all bookings");
          // No filter - show all bookings
        }
        
        query = query.order('Booking_date', { ascending: false });
        
        const { data, error } = await query;

        if (error) {
          console.error('Error fetching bookings:', error);
          throw error;
        }
        
        console.log("Bookings fetched:", data?.length || 0);
        
        // Transform data to make sure Booking_NO is a string
        const transformedData: Booking[] = (data || []).map(booking => ({
          ...booking,
          Booking_NO: String(booking.Booking_NO || '')
        }));
        
        setBookings(transformedData);
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

  return { bookings, setBookings, loading, currentUser };
};
