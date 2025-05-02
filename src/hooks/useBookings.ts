
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Booking {
  id: number;
  Booking_NO: string; // Always treat as string to avoid type mismatches
  jobno?: number;
  name: string;
  email?: string; // Make email optional to match database structure
  Phone_no: number;
  Address?: string;
  Pincode?: number;
  Booking_date: string;
  booking_time: string;
  Purpose: string;
  ServiceName?: string;
  SubService?: string;
  ProductName?: string;
  price?: number;
  Qty?: number;
  Status: string;
  StatusUpdated?: string;
  Assignedto?: string;
  AssignedBY?: string;
  AssingnedON?: string;
  ArtistId?: number;
  created_at?: string;
  prod_id?: number;
  Scheme?: string;
}

export const useBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasBookings, setHasBookings] = useState<boolean | null>(null);
  const { user } = useAuth();

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase.from('BookMST').select('*');
      
      // Filter bookings based on user role
      if (user.role === 'artist') {
        const artistId = parseInt(user.id, 10);
        if (!isNaN(artistId)) {
          console.log("Filtering bookings by artist ID:", artistId);
          query = query.eq('ArtistId', artistId);
        }
      } else if (user.role === 'member') {
        // For member users, only show their own bookings
        if (user.email) {
          console.log("Filtering bookings for member email:", user.email);
          query = query.eq('email', user.email);
        }
      }
      
      // Add order by to get the newest bookings first
      query = query.order('Booking_date', { ascending: false });
      
      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to ensure Booking_NO is always a string
      const transformedData: Booking[] = (data || []).map(booking => ({
        ...booking,
        Booking_NO: booking.Booking_NO?.toString() || ''
      }));
      
      setBookings(transformedData);
      
      // Set hasBookings based on whether we got any bookings
      setHasBookings(transformedData.length > 0);
      
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

  // Check if the current user has any bookings
  const checkUserHasBookings = async () => {
    if (!user || !user.email) return false;

    try {
      const { data, error } = await supabase
        .from('BookMST')
        .select('id')
        .eq('email', user.email)
        .limit(1);
      
      if (error) throw error;
      
      setHasBookings(data && data.length > 0);
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking bookings:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
      checkUserHasBookings();
    }
  }, [user]);

  return { bookings, setBookings, loading, fetchBookings, hasBookings, checkUserHasBookings };
};
