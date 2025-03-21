
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: number;
  Booking_NO: string;
  name: string;
  email: string;
  Phone_no: number;
  Booking_date: string;
  booking_time: string;
  Purpose: string;
  Status: string;
  price: number;
  Address?: string;
  Pincode?: number;
  created_at?: string;
}

export const useBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('BookMST')
        .select('*')
        .order('Booking_date', { ascending: false });

      if (error) throw error;
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

  useEffect(() => {
    fetchBookings();
  }, []);

  return { bookings, setBookings, loading };
};
