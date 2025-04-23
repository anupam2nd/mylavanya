
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
        
        if (user.role === 'artist') {
          if (user.id) {
            const artistId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
            query = query.eq('ArtistId', artistId);
          }
        } 
        else if (user.role === 'member') {
          // For members, show all bookings including pending ones that need checkout
          // Use lowercase email field consistently in the query
          query = query.or(`email.eq.${user.email}`);
        }
        else if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'controller') {
          console.log("Showing all bookings for admin/controller");
        }
        else {
          setBookings([]);
          setLoading(false);
          return;
        }
        
        const { data, error } = await query;

        if (error) throw error;
        console.log("Bookings fetched:", data?.length || 0);

        const processedBookings = data?.map(booking => {
          // Get the email value, handling both lowercase and uppercase variations
          const emailValue = booking.email || '';
          
          return {
            ...booking,
            id: booking.id.toString(),
            ArtistId: booking.ArtistId ? booking.ArtistId.toString() : undefined,
            Product: booking.Product ? booking.Product.toString() : undefined,
            // Handle email field consistently - use lowercase email in our code
            email: emailValue
          };
        }) || [];

        setBookings(processedBookings);
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
