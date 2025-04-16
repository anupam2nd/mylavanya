
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
        
        // Apply different filters based on user role
        if (user.role === 'artist') {
          // For artists, only show bookings assigned to them
          if (user.id) {
            console.log("Filtering bookings by artist ID:", user.id);
            query = query.eq('ArtistId', user.id.toString());
          }
        } 
        else if (user.role === 'member') {
          // For members, only show their own bookings
          console.log("Filtering bookings by member email:", user.email);
          query = query.eq('email', user.email);
        }
        // For admins, show all bookings (no filter)
        else if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'controller') {
          console.log("Showing all bookings for admin/controller");
        }
        else {
          // For any other role that shouldn't see bookings, return empty
          console.log("User role has no permissions to view bookings");
          setBookings([]);
          setLoading(false);
          return;
        }
        
        query = query.order('Booking_date', { ascending: false });
        
        const { data, error } = await query;

        if (error) throw error;
        console.log("Bookings fetched:", data?.length || 0);

        // Ensure all IDs are strings for consistent typing
        const processedBookings = data?.map(booking => ({
          ...booking,
          id: booking.id.toString(),
          ArtistId: booking.ArtistId ? booking.ArtistId.toString() : undefined,
          Product: booking.Product ? booking.Product.toString() : undefined
        })) || [];

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
