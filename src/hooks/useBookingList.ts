
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

export const useBookingList = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('BookMST')
          .select('*, uuid')
          .order('Booking_date', { ascending: false });

        if (error) throw error;
        
        // Convert database number types to strings for UI
        const formattedBookings: Booking[] = data?.map(booking => ({
          ...booking,
          id: booking.id.toString(),
          Booking_NO: booking.Booking_NO ? booking.Booking_NO.toString() : '',
          ArtistId: booking.ArtistId ? booking.ArtistId.toString() : undefined,
          Product: booking.Product ? booking.Product.toString() : undefined
        })) || [];
        
        setBookings(formattedBookings);
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
  }, [toast]);

  return { bookings, setBookings, loading };
};
