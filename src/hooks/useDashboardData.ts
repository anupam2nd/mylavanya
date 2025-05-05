
import { useState, useEffect, useMemo } from "react";
import { Booking } from "@/hooks/useBookings"; 
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { parseISO, subDays } from "date-fns";

export const useDashboardData = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        console.log("No user found in context, skipping fetch");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Attempting to fetch bookings for user: ${user.email}, role: ${user.role}, id: ${user.id}`);
        
        let query = supabase.from('BookMST').select('*');
        
        if (user.role === 'artist') {
          const artistId = parseInt(user.id, 10);
          if (!isNaN(artistId)) {
            console.log("Filtering dashboard bookings by ArtistId:", artistId);
            query = query.eq('ArtistId', artistId);
          }
        } else {
          query = query.eq('email', user.email);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching bookings:', error);
          setError("Failed to load bookings data");
          toast.error("Failed to load bookings data");
          return;
        }
        
        console.log(`User bookings found: ${data?.length || 0}`);
        
        if (data?.length > 0) {
          console.log("Sample booking:", JSON.stringify(data[0]));
        } else {
          console.log("No bookings found for the current user");
        }
        
        // Transform data to ensure Booking_NO is a string
        const transformedData: Booking[] = (data || []).map(booking => ({
          ...booking,
          Booking_NO: booking.Booking_NO?.toString() || ''
        }));
        
        setBookings(transformedData);
      } catch (error) {
        console.error('Unexpected error in fetch:', error);
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);

  const recentBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    
    const thirtyDaysAgo = subDays(new Date(), 30);
    return bookings.filter(booking => {
      if (!booking.Booking_date) return false;
      const date = parseISO(booking.Booking_date);
      return date >= thirtyDaysAgo;
    }).length;
  }, [bookings]);

  const totalRevenue = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    
    return bookings.reduce((sum, booking) => {
      if (booking.Status === "done" || booking.Status === "confirmed" || booking.Status === "beautician_assigned") {
        return sum + (booking.price || 0);
      }
      return sum;
    }, 0);
  }, [bookings]);

  return {
    bookings,
    recentBookings,
    totalRevenue,
    loading,
    error
  };
};
